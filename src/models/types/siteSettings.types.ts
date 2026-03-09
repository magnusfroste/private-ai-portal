export interface FaqItem {
  question: string;
  answer: string;
}

export interface SitemapEntry {
  url: string;
  priority: string;
  changefreq: string;
}

export interface SiteSettings {
  // Branding
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;

  // API
  api_base_url: string;

  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;

  // AEO
  jsonld_organization: string;
  faq_schema: FaqItem[];

  // Robots & Sitemap
  robots_txt: string;
  sitemap_entries: SitemapEntry[];

  // Visibility
  models_public: boolean;
}

export const defaultSiteSettings: SiteSettings = {
  site_name: "Autoversio",
  tagline: "Secure Private LLM Access for Developers",
  logo_url: "",
  favicon_url: "/favicon.png",
  seo_title: "Autoversio - Secure Private LLM Access for Developers",
  seo_description: "Enterprise-grade private LLM proxy for secure AI development. Access multiple models with transparent pricing and full data privacy.",
  seo_keywords: "LLM, AI, proxy, private, secure, API",
  og_title: "Autoversio - Secure Private LLM Access",
  og_description: "Enterprise-grade private LLM proxy for secure AI development",
  og_image_url: "/og-image.png",
  jsonld_organization: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Autoversio",
    "description": "Secure Private LLM Access for Developers"
  }, null, 2),
  faq_schema: [],
  robots_txt: `User-agent: *\nAllow: /`,
  sitemap_entries: [{ url: "/", priority: "1.0", changefreq: "weekly" }],
  models_public: false,
};
