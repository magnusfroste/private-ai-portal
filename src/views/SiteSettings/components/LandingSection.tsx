import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SiteSettings, HeroPillar, FeatureCard } from "@/models/types/siteSettings.types";

interface Props {
  settings: SiteSettings;
  onChange: (s: SiteSettings) => void;
}

export const LandingSection = ({ settings, onChange }: Props) => {
  const updatePillar = (index: number, field: keyof HeroPillar, value: string) => {
    const pillars = [...settings.hero_pillars];
    pillars[index] = { ...pillars[index], [field]: value };
    onChange({ ...settings, hero_pillars: pillars });
  };

  const addPillar = () => {
    onChange({ ...settings, hero_pillars: [...settings.hero_pillars, { title: "", description: "" }] });
  };

  const removePillar = (index: number) => {
    onChange({ ...settings, hero_pillars: settings.hero_pillars.filter((_, i) => i !== index) });
  };

  const updateFeature = (index: number, field: keyof FeatureCard, value: string | string[]) => {
    const cards = [...settings.feature_cards];
    cards[index] = { ...cards[index], [field]: value };
    onChange({ ...settings, feature_cards: cards });
  };

  const addFeature = () => {
    onChange({
      ...settings,
      feature_cards: [...settings.feature_cards, { title: "", description: "", bullets: [""] }],
    });
  };

  const removeFeature = (index: number) => {
    onChange({ ...settings, feature_cards: settings.feature_cards.filter((_, i) => i !== index) });
  };

  const updateCtaBullet = (index: number, value: string) => {
    const bullets = [...settings.cta_bullets];
    bullets[index] = value;
    onChange({ ...settings, cta_bullets: bullets });
  };

  const addCtaBullet = () => {
    onChange({ ...settings, cta_bullets: [...settings.cta_bullets, ""] });
  };

  const removeCtaBullet = (index: number) => {
    onChange({ ...settings, cta_bullets: settings.cta_bullets.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hero-sektion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Badge-text</Label>
            <Input value={settings.hero_badge} onChange={(e) => onChange({ ...settings, hero_badge: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rubrik</Label>
              <Input value={settings.hero_headline} onChange={(e) => onChange({ ...settings, hero_headline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rubrik (accent)</Label>
              <Input value={settings.hero_headline_accent} onChange={(e) => onChange({ ...settings, hero_headline_accent: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Underrubrik</Label>
            <Textarea value={settings.hero_subtitle} onChange={(e) => onChange({ ...settings, hero_subtitle: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA-knapp text</Label>
              <Input value={settings.hero_cta_text} onChange={(e) => onChange({ ...settings, hero_cta_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Navbar CTA-text</Label>
              <Input value={settings.navbar_cta_text} onChange={(e) => onChange({ ...settings, navbar_cta_text: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dokumentation URL</Label>
              <Input value={settings.hero_doc_url} onChange={(e) => onChange({ ...settings, hero_doc_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Dokumentation knapp-text</Label>
              <Input value={settings.hero_doc_text} onChange={(e) => onChange({ ...settings, hero_doc_text: e.target.value })} />
            </div>
          </div>

          {/* Pillars */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Pelare (kort under hero)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPillar}>
                <Plus className="w-3 h-3 mr-1" /> Lägg till
              </Button>
            </div>
            {settings.hero_pillars.map((p, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input placeholder="Titel" value={p.title} onChange={(e) => updatePillar(i, "title", e.target.value)} />
                  <Input placeholder="Beskrivning" value={p.description} onChange={(e) => updatePillar(i, "description", e.target.value)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePillar(i)} className="shrink-0">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features-sektion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rubrik</Label>
              <Input value={settings.features_headline} onChange={(e) => onChange({ ...settings, features_headline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rubrik (accent)</Label>
              <Input value={settings.features_headline_accent} onChange={(e) => onChange({ ...settings, features_headline_accent: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Underrubrik</Label>
            <Textarea value={settings.features_subtitle} onChange={(e) => onChange({ ...settings, features_subtitle: e.target.value })} rows={2} />
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Feature-kort</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <Plus className="w-3 h-3 mr-1" /> Lägg till
              </Button>
            </div>
            {settings.feature_cards.map((f, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Kort {i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <Input placeholder="Titel" value={f.title} onChange={(e) => updateFeature(i, "title", e.target.value)} />
                <Textarea placeholder="Beskrivning" value={f.description} onChange={(e) => updateFeature(i, "description", e.target.value)} rows={2} />
                <div className="space-y-2">
                  <Label className="text-xs">Punkter (kommaseparerade)</Label>
                  <Input
                    value={f.bullets.join(", ")}
                    onChange={(e) => updateFeature(i, "bullets", e.target.value.split(",").map((s) => s.trim()))}
                    placeholder="Punkt 1, Punkt 2, Punkt 3"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CTA-sektion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rubrik</Label>
              <Input value={settings.cta_headline} onChange={(e) => onChange({ ...settings, cta_headline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rubrik (accent)</Label>
              <Input value={settings.cta_headline_accent} onChange={(e) => onChange({ ...settings, cta_headline_accent: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Underrubrik</Label>
            <Textarea value={settings.cta_subtitle} onChange={(e) => onChange({ ...settings, cta_subtitle: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>CTA-knapp text</Label>
            <Input value={settings.cta_button_text} onChange={(e) => onChange({ ...settings, cta_button_text: e.target.value })} />
          </div>
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Punkter</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCtaBullet}>
                <Plus className="w-3 h-3 mr-1" /> Lägg till
              </Button>
            </div>
            {settings.cta_bullets.map((b, i) => (
              <div key={i} className="flex gap-2">
                <Input value={b} onChange={(e) => updateCtaBullet(i, e.target.value)} className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCtaBullet(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Footer-text</Label>
            <Input value={settings.footer_text} onChange={(e) => onChange({ ...settings, footer_text: e.target.value })} placeholder="Visas efter © År Sidnamn." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-2">
              <Label>Footer-länk text</Label>
              <Input value={settings.footer_link_text} onChange={(e) => onChange({ ...settings, footer_link_text: e.target.value })} placeholder="t.ex. Integritetspolicy" />
            </div>
            <div className="space-y-2">
              <Label>Footer-länk URL</Label>
              <Input value={settings.footer_link_url} onChange={(e) => onChange({ ...settings, footer_link_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
