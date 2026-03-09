import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, defaultSiteSettings } from "@/models/types/siteSettings.types";
import type { Json } from "@/integrations/supabase/types";

const SETTINGS_KEY = "site_settings";

export class SiteSettingsRepository {
  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data) return defaultSiteSettings;

    return { ...defaultSiteSettings, ...(data.value as Record<string, unknown>) } as SiteSettings;
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const { error } = await supabase
      .from("admin_settings")
      .upsert(
        [{ key: SETTINGS_KEY, value: JSON.parse(JSON.stringify(settings)) as Json }],
        { onConflict: "key" }
      );

    if (error) throw error;
  }

  async uploadAsset(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  }
}

export const siteSettingsRepository = new SiteSettingsRepository();
