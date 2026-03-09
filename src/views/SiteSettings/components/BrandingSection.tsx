import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { SiteSettings } from "@/models/types/siteSettings.types";

interface Props {
  settings: SiteSettings;
  onChange: (s: SiteSettings) => void;
  onUpload: (file: File, folder: string) => Promise<string>;
  isUploading: boolean;
}

export const BrandingSection = ({ settings, onChange, onUpload, isUploading }: Props) => {
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, folder: string, field: keyof SiteSettings) => {
    const url = await onUpload(file, folder);
    onChange({ ...settings, [field]: url });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Sidnamn</Label>
          <Input
            value={settings.site_name}
            onChange={(e) => onChange({ ...settings, site_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            value={settings.tagline}
            onChange={(e) => onChange({ ...settings, tagline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="h-10 rounded border border-border" />
            )}
            <Input
              value={settings.logo_url}
              onChange={(e) => onChange({ ...settings, logo_url: e.target.value })}
              placeholder="URL eller ladda upp"
              className="flex-1"
            />
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "logos", "logo_url");
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => logoRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Favicon</Label>
          <div className="flex items-center gap-3">
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Favicon" className="h-8 rounded border border-border" />
            )}
            <Input
              value={settings.favicon_url}
              onChange={(e) => onChange({ ...settings, favicon_url: e.target.value })}
              placeholder="URL eller ladda upp"
              className="flex-1"
            />
            <input
              ref={faviconRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "favicons", "favicon_url");
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => faviconRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <Label htmlFor="models-public">Visa modeller publikt</Label>
            <p className="text-xs text-muted-foreground">Tillåt att modellsidan visas utan inloggning</p>
          </div>
          <Switch
            id="models-public"
            checked={settings.models_public}
            onCheckedChange={(checked) => onChange({ ...settings, models_public: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
