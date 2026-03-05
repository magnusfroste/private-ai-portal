import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LiteLLMModelInfo {
  model_name: string;
  litellm_params?: {
    model?: string;
  };
  model_info?: {
    id?: string;
    max_tokens?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    input_cost_per_token?: number;
    output_cost_per_token?: number;
    mode?: string;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LITELLM_MASTER_KEY = Deno.env.get('LITELLM_MASTER_KEY');
    if (!LITELLM_MASTER_KEY) {
      return new Response(JSON.stringify({ error: 'LiteLLM configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.autoversio.ai/model/info', {
      headers: {
        'Authorization': `Bearer ${LITELLM_MASTER_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('LiteLLM /model/info error:', response.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch models' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const rawModels: LiteLLMModelInfo[] = data.data || [];

    const models = rawModels.map((m) => {
      const info = m.model_info || {};
      const litellmModel = m.litellm_params?.model || m.model_name;

      // Extract provider from model string (e.g. "openai/gpt-4" -> "OpenAI")
      const providerRaw = litellmModel.includes('/')
        ? litellmModel.split('/')[0]
        : 'unknown';
      const provider = providerRaw.charAt(0).toUpperCase() + providerRaw.slice(1);

      return {
        id: m.model_name,
        provider,
        max_input_tokens: info.max_input_tokens || info.max_tokens || null,
        max_output_tokens: info.max_output_tokens || null,
        input_cost_per_million: info.input_cost_per_token
          ? Math.round(info.input_cost_per_token * 1_000_000 * 1000) / 1000
          : null,
        output_cost_per_million: info.output_cost_per_token
          ? Math.round(info.output_cost_per_token * 1_000_000 * 1000) / 1000
          : null,
        mode: info.mode || null,
      };
    }).sort((a, b) => a.id.localeCompare(b.id));

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in list-models:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
