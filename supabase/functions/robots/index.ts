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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    if (error) throw error;

    const settings = data?.value as Record<string, unknown> | null;
    const robotsTxt = (settings?.robots_txt as string) || "User-agent: *\nAllow: /";

    // Use the request origin or fall back to supabase URL
    const baseUrl = new URL(req.url).searchParams.get("base") || supabaseUrl.replace(".supabase.co", ".lovable.app");

    // Append sitemap URL to robots.txt
    const content = `${robotsTxt}\n\nSitemap: ${baseUrl}/sitemap.xml`;

    return new Response(content, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(`Error generating robots.txt: ${err.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
