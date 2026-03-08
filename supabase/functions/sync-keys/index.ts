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

    // Fetch all active keys for this user
    const { data: activeKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, key_value, litellm_token, name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .is('revoked_at', null);

    if (keysError) {
      console.error('Error fetching keys:', keysError);
      return new Response(JSON.stringify({ error: 'Failed to fetch keys' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!activeKeys || activeKeys.length === 0) {
      return new Response(JSON.stringify({ synced: 0, deactivated: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Syncing ${activeKeys.length} active keys for user ${user.id}`);

    const deactivated: string[] = [];
    const now = new Date().toISOString();

    // Check each key against LiteLLM
    for (const key of activeKeys) {
      const keyIdentifier = key.litellm_token || key.key_value;

      try {
        const response = await fetch(
          `https://api.autoversio.ai/key/info?key=${keyIdentifier}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${litellmMasterKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 404) {
          // Key not found in LiteLLM — mark as inactive
          console.log(`Key "${key.name}" (${key.id}) not found in LiteLLM, deactivating`);

          const { error: updateError } = await supabase
            .from('api_keys')
            .update({ is_active: false, revoked_at: now })
            .eq('id', key.id);

          if (updateError) {
            console.error(`Failed to deactivate key ${key.id}:`, updateError);
          } else {
            deactivated.push(key.name);
          }
        } else if (!response.ok) {
          console.warn(`Unexpected status ${response.status} for key "${key.name}", skipping`);
        }
      } catch (err) {
        console.error(`Error checking key "${key.name}":`, err);
        // Skip this key on network errors, don't deactivate
      }
    }

    console.log(`Sync complete: ${deactivated.length} keys deactivated`);

    return new Response(
      JSON.stringify({
        synced: activeKeys.length,
        deactivated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-keys:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
