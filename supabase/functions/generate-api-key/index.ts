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
    expires_at: string | null;
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

// Function to create a new API key using LiteLLM's key management API
async function createLiteLLMKey(keyName: string, masterKey: string): Promise<ApiKeyResponse> {
  const response = await fetch('https://litellm.autoversio.ai/key/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${masterKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key_name: keyName,
      spend_limit: 10.0, // Set initial trial credits
      duration: '5d' // 5-day trial period
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create LiteLLM key');
  }

  return {
    success: true,
    data: {
      key: data.key,
      name: keyName,
      expires_at: data.expires_at || null,
      trial_credits_usd: 10.0,
      used_credits_usd: 0
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY');

    if (!LITELLM_MASTER_KEY) {
      console.error('Missing LiteLLM master key');
      return respondWithError(500, 'config_error', 'LiteLLM configuration missing');
    }

    // Verify JWT from the auth header to ensure user is authenticated
    if (!authHeader?.startsWith('Bearer ')) {
      return respondWithError(401, 'unauthorized', 'Missing or invalid authorization header');
    }

    const body = await req.json() as Partial<GenerateKeyRequest>;
    if (!body.keyName?.trim()) {
      return respondWithError(400, 'invalid_input', 'Key name is required');
    }
    
    console.log('Creating new LiteLLM key:', { keyName: body.keyName });

    if (!LITELLM_MASTER_KEY) {
      console.error('Missing LiteLLM configuration');
      return respondWithError(500, 'config_error', 'LiteLLM configuration missing');
    }

    try {
      // Generate key through LiteLLM's API
      const response = await createLiteLLMKey(body.keyName, LITELLM_MASTER_KEY);

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error creating LiteLLM key:', error);
      return respondWithError(500, 'litellm_error', 'Failed to generate API key');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return respondWithError(500, 'internal_error', errorMessage);
  }
});