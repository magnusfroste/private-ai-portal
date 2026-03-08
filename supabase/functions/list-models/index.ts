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

interface HealthEntry {
  model: string;
  status: string;
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

    const authHeaders = { 'Authorization': `Bearer ${LITELLM_MASTER_KEY}` };

    // Fetch models and health in parallel
    const [modelsRes, healthRes] = await Promise.all([
      fetch('https://api.autoversio.ai/model/info', { headers: authHeaders }),
      fetch('https://api.autoversio.ai/health', { headers: authHeaders }).catch(() => null),
    ]);

    if (!modelsRes.ok) {
      console.error('LiteLLM /model/info error:', modelsRes.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch models' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build health status map
    const healthMap = new Map<string, string>();
    if (healthRes && healthRes.ok) {
      try {
        const healthData = await healthRes.json();
        // LiteLLM /health returns { healthy_endpoints: [...], unhealthy_endpoints: [...] }
        const healthy: HealthEntry[] = healthData.healthy_endpoints || [];
        const unhealthy: HealthEntry[] = healthData.unhealthy_endpoints || [];
        for (const e of healthy) {
          healthMap.set(e.model, 'healthy');
        }
        for (const e of unhealthy) {
          healthMap.set(e.model, 'unhealthy');
        }
      } catch {
        console.warn('Could not parse health response');
      }
    }

    const data = await modelsRes.json();
    const rawModels: LiteLLMModelInfo[] = data.data || [];

    const models = rawModels.map((m) => {
      const info = m.model_info || {};
      const litellmModel = m.litellm_params?.model || m.model_name;

      const providerRaw = litellmModel.includes('/')
        ? litellmModel.split('/')[0]
        : 'unknown';
      const provider = providerRaw.charAt(0).toUpperCase() + providerRaw.slice(1);

      // Check health status by model_name
      const healthStatus = healthMap.get(m.model_name) || 'unknown';

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
        status: healthStatus,
      };
    }).sort((a, b) => {
      // Sort healthy first, then unknown, then unhealthy
      const order = { healthy: 0, unknown: 1, unhealthy: 2 };
      const diff = (order[a.status] ?? 1) - (order[b.status] ?? 1);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });

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
