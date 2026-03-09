import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { SiteSettings } from "@/models/types/siteSettings.types";

interface Props {
  settings: SiteSettings;
  onChange: (s: SiteSettings) => void;
  onUpload: (file: File, folder: string) => Promise<string>;
  isUploading: boolean;
}

export const SeoSection = ({ settings, onChange, onUpload, isUploading }: Props) => {
  const ogImageRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>SEO-titel</Label>
          <Input
            value={settings.seo_title}
            onChange={(e) => onChange({ ...settings, seo_title: e.target.value })}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">{settings.seo_title.length}/60 tecken</p>
        </div>
        <div className="space-y-2">
          <Label>Meta-beskrivning</Label>
          <Textarea
            value={settings.seo_description}
            onChange={(e) => onChange({ ...settings, seo_description: e.target.value })}
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">{settings.seo_description.length}/160 tecken</p>
        </div>
        <div className="space-y-2">
          <Label>Nyckelord</Label>
          <Input
            value={settings.seo_keywords}
            onChange={(e) => onChange({ ...settings, seo_keywords: e.target.value })}
            placeholder="kommaseparerade nyckelord"
          />
        </div>
        <div className="space-y-2">
          <Label>OG-titel</Label>
          <Input
            value={settings.og_title}
            onChange={(e) => onChange({ ...settings, og_title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>OG-beskrivning</Label>
          <Textarea
            value={settings.og_description}
            onChange={(e) => onChange({ ...settings, og_description: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>OG-bild</Label>
          <div className="flex items-center gap-3">
            {settings.og_image_url && (
              <img src={settings.og_image_url} alt="OG" className="h-12 rounded border border-border" />
            )}
            <Input
              value={settings.og_image_url}
              onChange={(e) => onChange({ ...settings, og_image_url: e.target.value })}
              placeholder="URL eller ladda upp"
              className="flex-1"
            />
            <input
              ref={ogImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "og-images").then((url) => onChange({ ...settings, og_image_url: url }));
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => ogImageRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
