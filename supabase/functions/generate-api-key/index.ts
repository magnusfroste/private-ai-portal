import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { keyName } = await req.json();
    
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY');
    const LITELLM_PROXY_URL = 'https://litellm.autoversio.ai';

    if (!LITELLM_MASTER_KEY) {
      throw new Error('LITELLM_MASTER_KEY not configured');
    }

    // Calculate expiration (5 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    console.log('Generating API key with LiteLLM for user:', user.id);

    // Generate key with LiteLLM
    const litellmResponse = await fetch(`${LITELLM_PROXY_URL}/key/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LITELLM_MASTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        key_alias: keyName,
        duration: '5d',
        max_budget: 25.0, // $25 trial credit
        metadata: {
          user_email: user.email,
          trial_key: true,
        }
      }),
    });

    if (!litellmResponse.ok) {
      const errorText = await litellmResponse.text();
      console.error('LiteLLM API error:', litellmResponse.status, errorText);
      throw new Error(`Failed to generate key: ${errorText}`);
    }

    const litellmData = await litellmResponse.json();
    console.log('LiteLLM key generated successfully:', litellmData.key);

    // Store key in our database
    const { data: apiKey, error: dbError } = await supabaseClient
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: keyName,
        key_value: litellmData.key,
        trial_credits_usd: 25.0,
        used_credits_usd: 0,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(JSON.stringify({ apiKey }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});