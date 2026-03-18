import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default values matching the app defaults
const defaults = {
  site_name: "PrivAI - Autoversio",
  seo_title: "PrivAI - Secure Private LLM Access for Developers",
  seo_description: "Enterprise-grade private LLM proxy for secure AI development. Access multiple models with transparent pricing and full data privacy.",
  seo_keywords: "LLM, AI, proxy, private, secure, API",
  og_title: "PrivAI - Secure Private LLM Access",
  og_description: "Enterprise-grade private LLM proxy for secure AI development",
  og_image_url: "/og-image.png",
  favicon_url: "/favicon.png",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    const s = (data?.value as Record<string, unknown>) || {};

    const title = (s.seo_title as string) || defaults.seo_title;
    const description = (s.seo_description as string) || defaults.seo_description;
    const keywords = (s.seo_keywords as string) || defaults.seo_keywords;
    const ogTitle = (s.og_title as string) || defaults.og_title;
    const ogDescription = (s.og_description as string) || defaults.og_description;
    const ogImage = (s.og_image_url as string) || defaults.og_image_url;
    const favicon = (s.favicon_url as string) || defaults.favicon_url;
    const siteName = (s.site_name as string) || defaults.site_name;
    const jsonldOrg = (s.jsonld_organization as string) || "";
    const faqSchema = (s.faq_schema as Array<{ question: string; answer: string }>) || [];

    // Build JSON-LD scripts
    let jsonldScripts = "";
    if (jsonldOrg) {
      jsonldScripts += `<script type="application/ld+json" id="jsonld-org">${jsonldOrg}</script>`;
    }
    if (faqSchema.length > 0) {
      const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqSchema.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      };
      jsonldScripts += `<script type="application/ld+json" id="jsonld-faq">${JSON.stringify(faqLd)}</script>`;
    }

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="${escapeHtml(favicon)}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta name="author" content="${escapeHtml(siteName)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}">
    <meta property="og:description" content="${escapeHtml(ogDescription)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
    <meta name="twitter:image" content="${escapeHtml(ogImage)}">
    ${jsonldScripts}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    // Fallback to a basic HTML if DB fails
    return new Response(`<!doctype html><html><head><title>PrivAI</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
