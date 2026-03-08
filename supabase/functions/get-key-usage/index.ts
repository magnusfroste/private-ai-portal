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
      
      // If key not found in LiteLLM (e.g. created before migration), return empty usage
      if (keyInfoResponse.status === 404) {
        const emptyResponse: KeyUsageResponse = {
          info: {
            key_name: apiKeyData.name,
            key_alias: apiKeyData.name,
            spend: 0,
            max_budget: 0,
            budget_remaining: 0,
            total_tokens: 0,
            prompt_tokens: 0,
            completion_tokens: 0,
            models: [],
            expires: '',
            metadata: {},
          },
          spend_logs: [],
        };
        return new Response(JSON.stringify(emptyResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
    
    console.log('[v2] Found key info - token fields:', { 
      total_tokens: keyInfo.total_tokens,
      prompt_tokens: keyInfo.prompt_tokens,
      completion_tokens: keyInfo.completion_tokens,
      spend: keyInfo.spend,
      max_budget: keyInfo.max_budget,
      team_id: keyInfo.team_id
    });

    // Fetch spend logs - use the correct endpoint for request logs
    let spendLogs = [];
    try {
      // Use /spend/logs endpoint for actual request logs, not /spend/keys
      const spendUrl = `https://api.autoversio.ai/spend/logs`;
      const params = new URLSearchParams();
      
      // Filter by key name or token
      if (keyInfo.key_alias) {
        params.append('key_name', keyInfo.key_alias);
      } else if (keyInfo.key_name) {
        params.append('key_name', keyInfo.key_name);
      }
      
      // Add team_id if available to filter logs
      if (keyInfo.team_id) {
        params.append('team_id', keyInfo.team_id);
      }
      
      const fullUrl = params.toString() ? `${spendUrl}?${params.toString()}` : spendUrl;
      console.log('Fetching spend logs from /spend/logs with params:', params.toString());
      
      const spendResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${litellmMasterKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (spendResponse.ok) {
        const spendData = await spendResponse.json();
        console.log('Spend API response type:', Array.isArray(spendData) ? 'array' : 'object');
        
        // Handle both array and object responses
        let allLogs = [];
        if (Array.isArray(spendData)) {
          allLogs = spendData;
        } else {
          allLogs = spendData.response || spendData.data || [];
        }
        
        console.log('Fetched spend logs (before filter):', allLogs.length, 'entries');
        
        if (allLogs.length > 0) {
          console.log('Sample log for filtering:', {
            log_key_name: allLogs[0].key_name,
            expected_key_alias: keyInfo.key_alias,
            expected_key_name: keyInfo.key_name
          });
        }
        
        // Filter logs to only include this specific key
        // Match by key_name matching the key_alias
        spendLogs = allLogs.filter((log: any) => {
          const matchesKeyName = log.key_name === keyInfo.key_alias || log.key_name === keyInfo.key_name;
          return matchesKeyName;
        });
        
        console.log('Filtered spend logs for this key:', spendLogs.length, 'entries');
        
        // If no logs after filtering, use all logs (might be API parameter filtering already)
        if (spendLogs.length === 0 && allLogs.length > 0) {
          console.log('No logs matched filter, using all fetched logs');
          spendLogs = allLogs;
        }
        if (spendLogs.length > 0) {
          console.log('Sample log entry keys:', Object.keys(spendLogs[0]));
        }
      } else {
        const errorText = await spendResponse.text();
        console.error('Failed to fetch spend logs:', spendResponse.status, errorText.slice(0, 300));
      }
    } catch (error) {
      console.error('Error fetching spend logs:', error);
      // Continue without spend logs if this fails
    }

    // Handle different possible field names for max_budget
    const maxBudget = keyInfo.max_budget || keyInfo.budget_limit || keyInfo.budget || keyInfo.max_budget_usd || 0;
    const spend = keyInfo.spend || keyInfo.total_spend || 0;
    
    // Calculate token counts from spend logs if not available in key info
    let totalTokens = keyInfo.total_tokens || 0;
    let promptTokens = keyInfo.prompt_tokens || 0;
    let completionTokens = keyInfo.completion_tokens || 0;
    
    if ((!totalTokens || totalTokens === 0) && spendLogs.length > 0) {
      console.log('Calculating tokens from', spendLogs.length, 'spend logs');
      
      // Log first few entries to debug
      console.log('First 3 log entries:', spendLogs.slice(0, 3).map((log: any) => ({
        total_tokens: log.total_tokens,
        spend: log.spend,
        model: log.model
      })));
      
      totalTokens = spendLogs.reduce((sum: number, log: any) => sum + (log.total_tokens || 0), 0);
      promptTokens = spendLogs.reduce((sum: number, log: any) => sum + (log.prompt_tokens || 0), 0);
      completionTokens = spendLogs.reduce((sum: number, log: any) => sum + (log.completion_tokens || 0), 0);
      
      const totalSpendFromLogs = spendLogs.reduce((sum: number, log: any) => sum + (log.spend || 0), 0);
      
      console.log('Calculated tokens:', { 
        totalTokens, 
        promptTokens, 
        completionTokens,
        totalSpendFromLogs,
        expectedTokens: Math.round(spend * 1000000) // $1 = 1M tokens
      });
      
      // If token count seems way off from spend, use spend-based estimate instead
      const expectedTokens = Math.round(spend * 1000000);
      if (totalTokens > expectedTokens * 2) {
        console.log('Token count seems inflated, using spend-based estimate instead');
        totalTokens = expectedTokens;
        // Estimate prompt/completion split (typically 95/5)
        promptTokens = Math.round(expectedTokens * 0.95);
        completionTokens = Math.round(expectedTokens * 0.05);
      }
    }
    
    const response: KeyUsageResponse = {
      info: {
        key_name: keyInfo.key_name || keyInfo.key_alias || 'Unknown',
        key_alias: keyInfo.key_alias || '',
        spend: spend,
        max_budget: maxBudget,
        budget_remaining: maxBudget - spend,
        total_tokens: totalTokens,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
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
