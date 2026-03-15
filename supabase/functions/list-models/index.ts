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

async function checkModelHealth(
  modelName: string,
  authHeaders: Record<string, string>,
  timeoutMs = 8000
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(
      `https://api.autoversio.ai/health?model=${encodeURIComponent(modelName)}`,
      { headers: authHeaders, signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) {
      await res.text();
      return 'unknown';
    }
    const data = await res.json();
    const healthy: HealthEntry[] = data.healthy_endpoints || [];
    const unhealthy: HealthEntry[] = data.unhealthy_endpoints || [];
    if (unhealthy.length > 0) return 'unhealthy';
    if (healthy.length > 0) return 'healthy';
    return 'unknown';
  } catch {
    return 'unknown';
  }
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

      // Try matching health by model_name, id, or litellm_params.model
      const healthStatus = healthMap.get(m.model_name)
        || healthMap.get(info.id || '')
        || healthMap.get(litellmModel)
        || null;

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
        status: healthStatus || 'unknown',
        litellmModel,
      };
    });

    // Individual health checks for unknown models
    const unknownModels = models.filter((m) => m.status === 'unknown');
    if (unknownModels.length > 0) {
      const checks = await Promise.all(
        unknownModels.map(async (m) => ({
          id: m.id,
          status: await checkModelHealth(m.id, authHeaders),
        }))
      );
      const checkMap = new Map(checks.map((c) => [c.id, c.status]));
      for (const m of models) {
        if (m.status === 'unknown' && checkMap.has(m.id)) {
          m.status = checkMap.get(m.id)!;
        }
      }
    }

    // Remove temp field and sort
    const result = models
      .map(({ litellmModel, ...rest }) => rest)
      .sort((a, b) => {
        const order: Record<string, number> = { healthy: 0, unknown: 1, unhealthy: 2 };
        const diff = (order[a.status] ?? 1) - (order[b.status] ?? 1);
        if (diff !== 0) return diff;
        return a.id.localeCompare(b.id);
      });

    return new Response(JSON.stringify({ models: result }), {
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
