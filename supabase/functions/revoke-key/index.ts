import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const litellmMasterKey = Deno.env.get('LITELLM_MASTER_KEY') || '';

    if (!litellmMasterKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { keyId } = await req.json();
    if (!keyId) {
      return new Response(JSON.stringify({ error: 'Missing keyId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the key and verify ownership
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('id, key_value, litellm_token, name, user_id')
      .eq('id', keyId)
      .single();

    if (keyError || !apiKey) {
      return new Response(JSON.stringify({ error: 'Key not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (apiKey.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Revoke in LiteLLM
    const keyIdentifier = apiKey.litellm_token || apiKey.key_value;
    let litellmRevoked = false;

    try {
      const response = await fetch('https://api.autoversio.ai/key/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${litellmMasterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys: [keyIdentifier] }),
      });

      litellmRevoked = response.ok;
      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`LiteLLM revoke returned ${response.status}: ${errorBody}`);
      }
    } catch (err) {
      console.error('Error revoking key in LiteLLM:', err);
      // Continue to deactivate in DB even if LiteLLM fails
    }

    // Deactivate in database
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ is_active: false, revoked_at: now })
      .eq('id', keyId);

    if (updateError) {
      console.error('Failed to update key in database:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to deactivate key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Key "${apiKey.name}" (${keyId}) revoked. LiteLLM: ${litellmRevoked}`);

    return new Response(
      JSON.stringify({
        success: true,
        litellm_revoked: litellmRevoked,
        name: apiKey.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in revoke-key:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
