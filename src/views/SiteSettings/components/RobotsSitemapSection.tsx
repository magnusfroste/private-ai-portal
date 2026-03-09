import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { SiteSettings, SitemapEntry } from "@/models/types/siteSettings.types";

interface Props {
  settings: SiteSettings;
  onChange: (s: SiteSettings) => void;
}

export const RobotsSitemapSection = ({ settings, onChange }: Props) => {
  const addEntry = () => {
    onChange({
      ...settings,
      sitemap_entries: [...settings.sitemap_entries, { url: "/", priority: "0.5", changefreq: "monthly" }],
    });
  };

  const updateEntry = (index: number, field: keyof SitemapEntry, value: string) => {
    const updated = settings.sitemap_entries.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...settings, sitemap_entries: updated });
  };

  const removeEntry = (index: number) => {
    onChange({
      ...settings,
      sitemap_entries: settings.sitemap_entries.filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Robots & Sitemap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>robots.txt</Label>
          <Textarea
            value={settings.robots_txt}
            onChange={(e) => onChange({ ...settings, robots_txt: e.target.value })}
            rows={6}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Sitemap-poster</Label>
            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
              <Plus className="w-3 h-3 mr-1" /> Lägg till
            </Button>
          </div>
          {settings.sitemap_entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 border border-border rounded-md p-2">
              <Input
                placeholder="URL"
                value={entry.url}
                onChange={(e) => updateEntry(i, "url", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Prioritet"
                value={entry.priority}
                onChange={(e) => updateEntry(i, "priority", e.target.value)}
                className="w-20"
              />
              <Select
                value={entry.changefreq}
                onValueChange={(v) => updateEntry(i, "changefreq", v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">always</SelectItem>
                  <SelectItem value="hourly">hourly</SelectItem>
                  <SelectItem value="daily">daily</SelectItem>
                  <SelectItem value="weekly">weekly</SelectItem>
                  <SelectItem value="monthly">monthly</SelectItem>
                  <SelectItem value="yearly">yearly</SelectItem>
                  <SelectItem value="never">never</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(i)}
                className="text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
