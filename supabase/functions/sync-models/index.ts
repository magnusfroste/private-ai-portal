import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LiteLLMModelInfo {
  model_name: string;
  litellm_params?: { model?: string };
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LITELLM_MASTER_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAnon.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Check admin role using service role client
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: hasRole } = await supabaseAdmin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!hasRole) {
        return new Response(JSON.stringify({ error: 'Admin required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const authHeaders = { 'Authorization': `Bearer ${LITELLM_MASTER_KEY}` };

    const [modelsRes, healthRes] = await Promise.all([
      fetch('https://api.autoversio.ai/model/info', { headers: authHeaders }),
      fetch('https://api.autoversio.ai/health', { headers: authHeaders }).catch(() => null),
    ]);

    if (!modelsRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch models from LiteLLM' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const healthMap = new Map<string, string>();
    if (healthRes && healthRes.ok) {
      try {
        const healthData = await healthRes.json();
        for (const e of (healthData.healthy_endpoints || []) as HealthEntry[]) {
          healthMap.set(e.model, 'healthy');
        }
        for (const e of (healthData.unhealthy_endpoints || []) as HealthEntry[]) {
          healthMap.set(e.model, 'unhealthy');
        }
      } catch { /* ignore */ }
    }

    const data = await modelsRes.json();
    const rawModels: LiteLLMModelInfo[] = data.data || [];

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    // Get existing models to preserve enabled state and huggingface_url
    const { data: existing } = await supabase.from('curated_models').select('id, enabled, huggingface_url, is_default');
    const existingMap = new Map((existing || []).map((m: { id: string; enabled: boolean; huggingface_url: string | null; is_default: boolean }) => [m.id, m]));

    const models = rawModels.map((m) => {
      const info = m.model_info || {};
      const litellmModel = m.litellm_params?.model || m.model_name;
      const providerRaw = litellmModel.includes('/') ? litellmModel.split('/')[0] : 'unknown';
      const provider = providerRaw.charAt(0).toUpperCase() + providerRaw.slice(1);
      const healthStatus = healthMap.get(m.model_name) || 'unknown';
      const stableId = info.id || m.model_name;
      const prev = existingMap.get(stableId);

      return {
        id: info.id || m.model_name,
        model_name: m.model_name,
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
        enabled: prev?.enabled ?? false,
        huggingface_url: prev?.huggingface_url ?? null,
        last_synced_at: now,
        updated_at: now,
      };
    });

    // Upsert all models
    const { error: upsertError } = await supabase
      .from('curated_models')
      .upsert(models, { onConflict: 'id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to save models' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ synced: models.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sync-models:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
