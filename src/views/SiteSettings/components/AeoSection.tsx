import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SiteSettings, FaqItem } from "@/models/types/siteSettings.types";

interface Props {
  settings: SiteSettings;
  onChange: (s: SiteSettings) => void;
}

export const AeoSection = ({ settings, onChange }: Props) => {
  const addFaq = () => {
    onChange({
      ...settings,
      faq_schema: [...settings.faq_schema, { question: "", answer: "" }],
    });
  };

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = settings.faq_schema.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...settings, faq_schema: updated });
  };

  const removeFaq = (index: number) => {
    onChange({
      ...settings,
      faq_schema: settings.faq_schema.filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AEO / Strukturerad data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>JSON-LD (Organization)</Label>
          <Textarea
            value={settings.jsonld_organization}
            onChange={(e) => onChange({ ...settings, jsonld_organization: e.target.value })}
            rows={8}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>FAQ Schema</Label>
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>
              <Plus className="w-3 h-3 mr-1" /> Lägg till
            </Button>
          </div>
          {settings.faq_schema.map((faq, i) => (
            <div key={i} className="border border-border rounded-md p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Fråga"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                  />
                  <Textarea
                    placeholder="Svar"
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFaq(i)}
                  className="text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
