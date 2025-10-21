/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

interface GenerateKeyRequest {
  keyName: string;
}

interface ApiKeyResponse {
  success: boolean;
  data?: {
    key: string;
    name: string;
    expires_at: string;
    trial_credits_usd: number;
    used_credits_usd: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const respondWithError = (status: number, code: string, message: string): Response => {
  const response: ApiKeyResponse = {
    success: false,
    error: { code, message }
  };
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Debug log for auth header and request details
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header:', authHeader);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Environment variables present:', {
      hasServiceRole: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasLiteLLMKey: !!Deno.env.get('LITELLM_MASTER_KEY'),
    });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      console.error('Missing required environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceRole: !!supabaseServiceRoleKey,
        hasAnonKey: !!supabaseAnonKey
      });
      return respondWithError(500, 'config_error', 'Missing required Supabase configuration');
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    // Create client with user's JWT for auth check
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader ?? '' },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return respondWithError(401, 'unauthorized', 'User not authenticated');
    }

    const body = await req.json() as Partial<GenerateKeyRequest>;
    if (!body.keyName?.trim()) {
      return respondWithError(400, 'invalid_input', 'Key name is required');
    }
    
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY');
    const LITELLM_PROXY_URL = 'https://litellm.autoversio.ai';

    if (!LITELLM_MASTER_KEY) {
      console.error('Missing LiteLLM configuration');
      return respondWithError(500, 'config_error', 'LiteLLM configuration missing');
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
        key_alias: body.keyName,
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
      return respondWithError(502, 'litellm_error', `Failed to generate key: ${errorText}`);
    }

    const litellmData = await litellmResponse.json();
    console.log('LiteLLM key generated successfully:', litellmData.key);

    // Store key in our database using admin client
    const { data: apiKey, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: body.keyName,
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
      return respondWithError(500, 'database_error', 'Failed to store API key');
    }

    const response: ApiKeyResponse = {
      success: true,
      data: {
        key: apiKey.key_value,
        name: apiKey.name,
        expires_at: apiKey.expires_at,
        trial_credits_usd: apiKey.trial_credits_usd,
        used_credits_usd: apiKey.used_credits_usd,
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return respondWithError(500, 'internal_error', errorMessage);
  }
});