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
    const entries = (settings?.sitemap_entries as Array<{ url: string; priority: string; changefreq: string }>) || [
      { url: "/", priority: "1.0", changefreq: "weekly" },
    ];

    // Use the request origin or fall back to supabase URL
    const baseUrl = new URL(req.url).searchParams.get("base") || supabaseUrl.replace(".supabase.co", ".lovable.app");

    const urls = entries
      .map(
        (e) => `  <url>
    <loc>${baseUrl}${e.url}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (err) {
    return new Response(`Error generating sitemap: ${err.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
