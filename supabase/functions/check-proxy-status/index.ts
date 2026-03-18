import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if LITELLM_MASTER_KEY is set
    const masterKey = Deno.env.get("LITELLM_MASTER_KEY");
    const hasKey = !!masterKey && masterKey.length > 0;
    const keyPrefix = hasKey ? masterKey!.substring(0, 6) + "..." : null;

    if (!hasKey) {
      return new Response(
        JSON.stringify({ has_key: false, connected: false, key_prefix: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the API base URL from admin_settings
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: settingsData } = await serviceClient
      .from("admin_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    const settings = settingsData?.value as Record<string, unknown> | null;
    const apiBaseUrl = (settings?.api_base_url as string) || "https://api.autoversio.ai";

    let connected = false;
    let modelCount: number | undefined;
    let error: string | undefined;
    let healthResponse: string | undefined;

    // Try /health endpoint
    try {
      const healthRes = await fetch(`${apiBaseUrl}/health`, {
        headers: { Authorization: `Bearer ${masterKey}` },
        signal: AbortSignal.timeout(15000),
      });

      healthResponse = `${healthRes.status} ${healthRes.statusText}`;

      if (healthRes.ok) {
        connected = true;
        const body = await healthRes.text();
        healthResponse += ` - ${body.substring(0, 200)}`;
      } else {
        const body = await healthRes.text();
        error = `Proxy svarade med ${healthRes.status}: ${body.substring(0, 200)}`;
      }
    } catch (err) {
      error = `Kunde inte nå ${apiBaseUrl}/health: ${err.message}`;
    }

    // If health worked, try model count
    if (connected) {
      try {
        const modelsRes = await fetch(`${apiBaseUrl}/v1/models`, {
          headers: { Authorization: `Bearer ${masterKey}` },
          signal: AbortSignal.timeout(10000),
        });
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          modelCount = modelsData?.data?.length || 0;
        }
      } catch {
        // Model count is optional
      }
    }

    return new Response(
      JSON.stringify({
        has_key: true,
        key_prefix: keyPrefix,
        connected,
        api_url: apiBaseUrl,
        model_count: modelCount,
        health_response: healthResponse,
        error,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
