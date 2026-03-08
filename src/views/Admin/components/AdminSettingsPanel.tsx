import { useState, useEffect } from "react";
import { Settings, Save, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { modelService } from "@/models/services/modelService";

interface AdminSettings {
  default_user_budget_usd: number;
  chat_enabled_models: string[];
  chat_default_model: string;
}

export const AdminSettingsPanel = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    default_user_budget_usd: 25,
    chat_enabled_models: [],
    chat_default_model: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: allModels = [] } = useQuery({
    queryKey: ["available-models"],
    queryFn: () => modelService.getAvailableModels(),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (error) throw error;

      if (data) {
        const mapped: Record<string, unknown> = {};
        data.forEach((row: { key: string; value: unknown }) => {
          mapped[row.key] = row.value;
        });
        setSettings({
          default_user_budget_usd: Number(mapped.default_user_budget_usd ?? 25),
          chat_enabled_models: (mapped.chat_enabled_models as string[]) || [],
          chat_default_model: (mapped.chat_default_model as string) || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const entries: [string, unknown][] = [
        ["default_user_budget_usd", settings.default_user_budget_usd],
        ["chat_enabled_models", settings.chat_enabled_models],
        ["chat_default_model", settings.chat_default_model],
      ];
      for (const [key, value] of entries) {
        const { error } = await supabase
          .from("admin_settings")
          .update({ value: value as never, updated_at: new Date().toISOString() })
          .eq("key", key);
        if (error) throw error;
      }
      toast.success("Alla inställningar sparade");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Kunde inte spara inställningar");
    } finally {
      setSaving(false);
    }
  };

  const addModel = (modelId: string) => {
    if (!modelId || settings.chat_enabled_models.includes(modelId)) return;
    const updated = [...settings.chat_enabled_models, modelId];
    setSettings((s) => ({
      ...s,
      chat_enabled_models: updated,
      chat_default_model: s.chat_default_model || modelId,
    }));
  };

  const removeModel = (modelId: string) => {
    const updated = settings.chat_enabled_models.filter((m) => m !== modelId);
    setSettings((s) => ({
      ...s,
      chat_enabled_models: updated,
      chat_default_model: s.chat_default_model === modelId
        ? (updated[0] || "")
        : s.chat_default_model,
    }));
  };

  const availableToAdd = allModels.filter(
    (m) => !settings.chat_enabled_models.includes(m.id)
  );

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          Laddar inställningar...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Standardinställningar
        </CardTitle>
        <CardDescription>
          Dessa värden påverkar nya användare och chatten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget">Startbudget (USD)</Label>
          <Input
            id="budget"
            type="number"
            min={0}
            step={5}
            value={settings.default_user_budget_usd}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                default_user_budget_usd: Number(e.target.value),
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            LiteLLM user max_budget vid registrering
          </p>
        </div>

        {/* Chat Models */}
        <div className="space-y-3">
          <Label>Modeller synliga i chatten</Label>
          <p className="text-xs text-muted-foreground">
            Bara dessa modeller visas för användare i chat-playgrounden
          </p>

          {settings.chat_enabled_models.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.chat_enabled_models.map((modelId) => {
                const info = allModels.find((m) => m.id === modelId);
                return (
                  <Badge
                    key={modelId}
                    variant={modelId === settings.chat_default_model ? "default" : "secondary"}
                    className="flex items-center gap-1.5 py-1 px-2.5 text-xs cursor-default"
                  >
                    {info && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          info.status === "healthy"
                            ? "bg-emerald-500"
                            : info.status === "unhealthy"
                            ? "bg-destructive"
                            : "bg-blue-400"
                        }`}
                      />
                    )}
                    <span className="font-mono">{modelId}</span>
                    {modelId === settings.chat_default_model && (
                      <span className="text-[10px] opacity-70 ml-1">default</span>
                    )}
                    <button
                      onClick={() => removeModel(modelId)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Inga modeller valda — alla LiteLLM-modeller visas
            </p>
          )}

          {availableToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={addModel}>
                <SelectTrigger className="w-[300px] h-8 text-xs">
                  <SelectValue placeholder="Lägg till modell..." />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((m) => (
                    <SelectItem key={m.id} value={m.id} textValue={m.id}>
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === "healthy"
                              ? "bg-emerald-500"
                              : m.status === "unhealthy"
                              ? "bg-destructive"
                              : "bg-blue-400"
                          }`}
                        />
                        <span className="text-muted-foreground w-14 shrink-0">{m.provider}</span>
                        <span className="font-mono">{m.id}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Default Model */}
        {settings.chat_enabled_models.length > 0 && (
          <div className="space-y-2">
            <Label>Standardmodell i chatten</Label>
            <Select
              value={settings.chat_default_model}
              onValueChange={(v) => setSettings((s) => ({ ...s, chat_default_model: v }))}
            >
              <SelectTrigger className="w-[300px] h-8 text-xs">
                <SelectValue placeholder="Välj standardmodell..." />
              </SelectTrigger>
              <SelectContent>
                {settings.chat_enabled_models.map((id) => (
                  <SelectItem key={id} value={id} textValue={id}>
                    <span className="font-mono text-xs">{id}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleSaveAll} disabled={saving} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Sparar..." : "Spara inställningar"}
        </Button>
      </CardContent>
    </Card>
  );
};
