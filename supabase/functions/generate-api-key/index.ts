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
): Promise<{
  key: string;
  token: string;
  key_alias: string;
  max_budget: number;
  duration: string;
  team_id?: string;
}> {
  console.log('Calling LiteLLM API at https://api.autoversio.ai/key/generate');
  
  const requestBody: {
    key_alias: string;
    max_budget: number;
    duration: string;
    models?: string[];
    team_id?: string;
  } = {
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
  
  const response = await fetch('https://api.autoversio.ai/key/generate', {
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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

    // 1. Check trial key limit
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('trial_keys_created, max_trial_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return respondWithError(500, 'database_error', 'Failed to fetch user profile');
    }

    if (profile.trial_keys_created >= profile.max_trial_keys) {
      console.warn(`Trial limit reached for user ${user.id}: ${profile.trial_keys_created}/${profile.max_trial_keys}`);
      return respondWithError(403, 'trial_limit_exceeded', 
        `Trial key limit reached (${profile.trial_keys_created}/${profile.max_trial_keys}). Upgrade to create more keys.`
      );
    }

    try {
      // 2. Generate key through LiteLLM's API
      const liteLLMResponse = await createLiteLLMKey(
        body.keyName, 
        LITELLM_MASTER_KEY,
        body.models,
        body.teamId
      );
      
      console.log('LiteLLM response structure:', {
        hasKey: !!liteLLMResponse.key,
        hasToken: !!liteLLMResponse.token,
        keys: Object.keys(liteLLMResponse)
      });
      
      // Calculate expiration date (5 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);

      // 3. Store the key in the database with token identifier
      const { data: apiKey, error: dbError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: body.keyName,
          key_value: liteLLMResponse.key,
          litellm_token: liteLLMResponse.token || null,
          expires_at: expiresAt.toISOString(),
          trial_credits_usd: 25.0,
          used_credits_usd: 0,
          is_active: true
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database save failed:', {
          error: dbError,
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          orphanedKey: {
            litellm_key: liteLLMResponse.key,
            litellm_token: liteLLMResponse.token,
            key_alias: body.keyName,
            user_id: user.id
          }
        });
        
        // TODO: Consider implementing LiteLLM key deletion here to rollback
        // This would require calling DELETE on LiteLLM API with the token
        
        throw new Error(`Failed to save API key to database: ${dbError.message || 'Unknown database error'}`);
      }

      // 4. Increment trial key counter (atomic operation with optimistic locking)
      const { error: incrementError } = await supabase.rpc('increment_trial_key_count', {
        user_id_param: user.id
      });

      if (incrementError) {
        console.error('Failed to increment trial key counter:', incrementError);
        // Key was created but counter wasn't incremented - log for manual fix
        // Don't fail the request as the key is valid
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