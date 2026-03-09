import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminRepository } from "@/data/repositories/adminRepository";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { SiteSettings, defaultSiteSettings } from "@/models/types/siteSettings.types";
import { BrandingSection } from "./components/BrandingSection";
import { SeoSection } from "./components/SeoSection";
import { AeoSection } from "./components/AeoSection";
import { RobotsSitemapSection } from "./components/RobotsSitemapSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";

export const SiteSettingsPage = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => adminRepository.checkIsAdmin(),
  });

  const { settings, isLoading, save, isSaving, uploadAsset, isUploading } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(defaultSiteSettings);

  const handleUpload = async (file: File, folder: string) => {
    return uploadAsset({ file, folder });
  };

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/dashboard");
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webbplatsinställningar</h1>
          <p className="text-muted-foreground text-sm">Hantera branding, SEO, AEO och konfiguration</p>
        </div>
        <Button onClick={() => save(draft)} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Spara
        </Button>
      </div>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="aeo">AEO</TabsTrigger>
          <TabsTrigger value="robots">Robots & Sitemap</TabsTrigger>
        </TabsList>
        <TabsContent value="branding" className="mt-4">
          <BrandingSection settings={draft} onChange={setDraft} onUpload={handleUpload} isUploading={isUploading} />
        </TabsContent>
        <TabsContent value="seo" className="mt-4">
          <SeoSection settings={draft} onChange={setDraft} onUpload={handleUpload} isUploading={isUploading} />
        </TabsContent>
        <TabsContent value="aeo" className="mt-4">
          <AeoSection settings={draft} onChange={setDraft} />
        </TabsContent>
        <TabsContent value="robots" className="mt-4">
          <RobotsSitemapSection settings={draft} onChange={setDraft} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
