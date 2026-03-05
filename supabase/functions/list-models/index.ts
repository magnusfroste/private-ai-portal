import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const response = await fetch('https://api.autoversio.ai/models', {
      headers: {
        'Authorization': `Bearer ${LITELLM_MASTER_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('LiteLLM /models error:', response.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch models' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    // Extract just model IDs from the OpenAI-compatible response
    const modelNames: string[] = (data.data || [])
      .map((m: { id: string }) => m.id)
      .sort();

    return new Response(JSON.stringify({ models: modelNames }), {
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
