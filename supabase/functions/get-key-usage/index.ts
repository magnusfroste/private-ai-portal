import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeyUsageResponse {
  info: {
    key_name: string;
    key_alias: string;
    spend: number;
    max_budget: number;
    budget_remaining: number;
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    models: string[];
    expires: string;
    metadata: any;
  };
  spend_logs?: Array<{
    request_id: string;
    startTime: string;
    model: string;
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    spend: number;
    status: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const litellmMasterKey = Deno.env.get('LITELLM_MASTER_KEY') || '';

    if (!litellmMasterKey) {
      throw new Error('LITELLM_MASTER_KEY is not configured');
    }

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
      return new Response(JSON.stringify({ error: 'keyId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the API key from database
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('key_value, litellm_token, user_id, name')
      .eq('id', keyId)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the key belongs to the user
    if (apiKeyData.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized access to key' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching key info from LiteLLM API', {
      hasToken: !!apiKeyData.litellm_token,
      usingTokenId: !!apiKeyData.litellm_token,
      keyName: apiKeyData.name,
      keyValueSuffix: apiKeyData.key_value.slice(-5)
    });

    // Prefer using token identifier if available, fallback to key_value
    const keyIdentifier = apiKeyData.litellm_token || apiKeyData.key_value;

    // Fetch key info from LiteLLM
    const keyInfoResponse = await fetch(
      `https://api.autoversio.ai/key/info?key=${keyIdentifier}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${litellmMasterKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!keyInfoResponse.ok) {
      const errorText = await keyInfoResponse.text();
      console.error('LiteLLM API error:', keyInfoResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch key info from LiteLLM' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keyInfoResponse_data = await keyInfoResponse.json();
    
    console.log('LiteLLM key info response type:', Array.isArray(keyInfoResponse_data) ? 'array' : 'object');
    console.log('LiteLLM key info response length:', Array.isArray(keyInfoResponse_data) ? keyInfoResponse_data.length : 'N/A');
    console.log('LiteLLM raw response keys:', Object.keys(keyInfoResponse_data));
    console.log('LiteLLM raw response sample:', JSON.stringify(keyInfoResponse_data).slice(0, 500));
    
    // The /key/info endpoint returns:
    // - A single object when queried with a specific token
    // - An array of all keys when queried without parameters
    let keyInfo;
    if (Array.isArray(keyInfoResponse_data)) {
      console.log('Searching for key in array of', keyInfoResponse_data.length, 'keys');
      console.log('Search criteria:', {
        token: apiKeyData.litellm_token,
        key_alias: apiKeyData.name,
        key_suffix: apiKeyData.key_value.slice(-5)
      });
      
      // Find the key by matching token, key_alias, or key_name suffix
      keyInfo = keyInfoResponse_data.find(k => {
        const matchesToken = apiKeyData.litellm_token && k.token === apiKeyData.litellm_token;
        const matchesAlias = apiKeyData.name && k.key_alias === apiKeyData.name;
        const matchesKeySuffix = k.key_name && k.key_name.includes(apiKeyData.key_value.slice(-5));
        
        return matchesToken || matchesAlias || matchesKeySuffix;
      });
      
      if (!keyInfo) {
        console.error('Could not find matching key in LiteLLM response');
      }
    } else {
      // Single object response - check if it has nested 'info' field
      if (keyInfoResponse_data.info) {
        keyInfo = keyInfoResponse_data.info;
        console.log('Using nested info object from response');
      } else {
        keyInfo = keyInfoResponse_data;
        console.log('Using single key object from response');
      }
    }
    
    if (!keyInfo) {
      return new Response(JSON.stringify({ error: 'Key not found in LiteLLM response' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Found key info - all fields:', Object.keys(keyInfo));
    console.log('Found key info - values:', { 
      key_alias: keyInfo.key_alias, 
      max_budget: keyInfo.max_budget,
      spend: keyInfo.spend,
      // Try alternate field names
      budget_limit: keyInfo.budget_limit,
      total_spend: keyInfo.total_spend
    });
    console.log('Full keyInfo object:', JSON.stringify(keyInfo).slice(0, 1000));

    // Optionally fetch spend logs using token identifier
    let spendLogs = [];
    try {
      const spendResponse = await fetch(
        `https://api.autoversio.ai/spend/keys?api_key=${keyIdentifier}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${litellmMasterKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (spendResponse.ok) {
        const spendData = await spendResponse.json();
        spendLogs = spendData.response || [];
      }
    } catch (error) {
      console.error('Error fetching spend logs:', error);
      // Continue without spend logs if this fails
    }

    // Handle different possible field names for max_budget
    const maxBudget = keyInfo.max_budget || keyInfo.budget_limit || keyInfo.budget || keyInfo.max_budget_usd || 0;
    const spend = keyInfo.spend || keyInfo.total_spend || 0;
    
    const response: KeyUsageResponse = {
      info: {
        key_name: keyInfo.key_name || keyInfo.key_alias || 'Unknown',
        key_alias: keyInfo.key_alias || '',
        spend: spend,
        max_budget: maxBudget,
        budget_remaining: maxBudget - spend,
        total_tokens: keyInfo.total_tokens || 0,
        prompt_tokens: keyInfo.prompt_tokens || 0,
        completion_tokens: keyInfo.completion_tokens || 0,
        models: keyInfo.models || [],
        expires: keyInfo.expires || '',
        metadata: keyInfo.metadata || {},
      },
      spend_logs: spendLogs.slice(0, 50), // Limit to 50 most recent logs
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-key-usage function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
