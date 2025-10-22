/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface GenerateKeyRequest {
  keyName: string;
  models?: string[];
  teamId?: string;
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
async function createLiteLLMKey(
  keyName: string, 
  masterKey: string,
  models?: string[],
  teamId?: string
): Promise<any> {
  console.log('Calling LiteLLM API at https://litellm.autoversio.ai/key/generate');
  
  const requestBody: any = {
    key_alias: keyName,
    max_budget: 25.0,
    duration: '5d'
  };

  if (models && models.length > 0) {
    requestBody.models = models;
  }

  if (teamId) {
    requestBody.team_id = teamId;
  }

  console.log('Request body:', requestBody);
  
  const response = await fetch('https://litellm.autoversio.ai/key/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${masterKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('LiteLLM API response:', { status: response.status, data });
  
  if (!response.ok) {
    throw new Error(data.error || `LiteLLM API error: ${response.status}`);
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LITELLM_MASTER_KEY) {
      console.error('Missing LiteLLM master key');
      return respondWithError(500, 'config_error', 'LiteLLM configuration missing');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return respondWithError(500, 'config_error', 'Supabase configuration missing');
    }

    // Verify JWT from the auth header to ensure user is authenticated
    if (!authHeader?.startsWith('Bearer ')) {
      return respondWithError(401, 'unauthorized', 'Missing or invalid authorization header');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify the user's JWT and get user ID
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return respondWithError(401, 'unauthorized', 'Invalid authentication token');
    }

    const body = await req.json() as Partial<GenerateKeyRequest>;
    if (!body.keyName?.trim()) {
      return respondWithError(400, 'invalid_input', 'Key name is required');
    }
    
    console.log('Creating new LiteLLM key for user:', { userId: user.id, keyName: body.keyName });

    try {
      // Generate key through LiteLLM's API
      const liteLLMResponse = await createLiteLLMKey(
        body.keyName, 
        LITELLM_MASTER_KEY,
        body.models,
        body.teamId
      );
      
      // Calculate expiration date (5 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);

      // Store the key in the database
      const { data: apiKey, error: dbError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: body.keyName,
          key_value: liteLLMResponse.key,
          expires_at: expiresAt.toISOString(),
          trial_credits_usd: 25.0,
          used_credits_usd: 0,
          is_active: true
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save API key to database');
      }

      const response: ApiKeyResponse = {
        success: true,
        data: {
          key: liteLLMResponse.key,
          name: body.keyName,
          expires_at: expiresAt.toISOString(),
          trial_credits_usd: 25.0,
          used_credits_usd: 0
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error creating LiteLLM key:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate API key';
      return respondWithError(500, 'litellm_error', errorMsg);
    }

  } catch (error) {
    console.error('Error in generate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return respondWithError(500, 'internal_error', errorMessage);
  }
});