const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get("url") || "https://api.autoversio.ai/health";
  const results: Record<string, unknown> = { target };

  // Test 1: Simple fetch without auth
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(10000) });
    const body = await res.text();
    results.no_auth = { status: res.status, body: body.substring(0, 500) };
  } catch (err) {
    results.no_auth = { error: err.message };
  }

  // Test 2: With master key
  const masterKey = Deno.env.get("LITELLM_MASTER_KEY");
  if (masterKey) {
    try {
      const res = await fetch(target, {
        headers: { Authorization: `Bearer ${masterKey}` },
        signal: AbortSignal.timeout(10000),
      });
      const body = await res.text();
      results.with_auth = { status: res.status, body: body.substring(0, 500) };
    } catch (err) {
      results.with_auth = { error: err.message };
    }
  }

  // Test 3: DNS check - try to reach the base domain
  try {
    const res = await fetch("https://api.autoversio.ai/", { signal: AbortSignal.timeout(10000) });
    const body = await res.text();
    results.base_url = { status: res.status, body: body.substring(0, 300) };
  } catch (err) {
    results.base_url = { error: err.message };
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
