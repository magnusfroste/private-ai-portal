import { useState } from "react";
import { Server, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface ProxyStatus {
  has_key: boolean;
  key_prefix: string | null;
  connected: boolean;
  api_url?: string;
  litellm_version?: string;
  model_count?: number;
  health_response?: string;
  error?: string;
}

export const ProxyConfigCard = () => {
  const [status, setStatus] = useState<ProxyStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-proxy-status");
      if (error) throw error;
      setStatus(data as ProxyStatus);
    } catch (err) {
      console.error("Proxy check error:", err);
      setStatus({ has_key: false, key_prefix: null, connected: false, error: "Kunde inte köra kontrollen" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          LLM Proxy-konfiguration
        </CardTitle>
        <CardDescription>
          Anslutning till LiteLLM proxy. Stöd för fler proxies kommer snart.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status && !checking ? (
          <Button onClick={checkStatus} variant="outline" className="w-full md:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Kontrollera proxy-anslutning
          </Button>
        ) : checking ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Kontrollerar...
          </div>
        ) : status && (
          <div className="space-y-4">
            {/* Proxy type */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">LiteLLM</Badge>
              <span className="text-xs text-muted-foreground">Aktiv proxy</span>
            </div>

            {/* Key status */}
            <div className="flex items-center gap-3 flex-wrap">
              {status.has_key ? (
                <Badge variant="default" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Master Key konfigurerad
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Master Key saknas
                </Badge>
              )}
              {status.key_prefix && (
                <span className="text-xs text-muted-foreground font-mono">
                  Nyckel: {status.key_prefix}
                </span>
              )}
            </div>

            {/* Connection status */}
            {status.has_key && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Anslutning</p>
                    <p className={status.connected ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
                      {status.connected ? "Ansluten ✓" : "Kunde inte nå proxy"}
                    </p>
                  </div>
                  {status.api_url && (
                    <div>
                      <p className="text-muted-foreground text-xs">API URL</p>
                      <p className="font-mono text-xs truncate">{status.api_url}</p>
                    </div>
                  )}
                  {status.model_count !== undefined && (
                    <div>
                      <p className="text-muted-foreground text-xs">Modeller</p>
                      <p className="font-medium">{status.model_count} aktiva</p>
                    </div>
                  )}
                  {status.health_response && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Health-svar</p>
                      <p className="font-mono text-xs text-muted-foreground truncate">{status.health_response}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error details */}
            {status.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{status.error}</p>
                </div>
              </div>
            )}

            {/* Missing key instructions */}
            {!status.has_key && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-destructive">LITELLM_MASTER_KEY är inte konfigurerad</p>
                    <p className="text-muted-foreground">
                      Portalen behöver en master key för att kommunicera med din LiteLLM-proxy.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Hitta din LiteLLM master key i din <code className="text-xs bg-muted px-1 py-0.5 rounded">config.yaml</code></li>
                      <li>Gå till <strong>Lovable Cloud → Secrets</strong></li>
                      <li>Lägg till en secret med namn <code className="text-xs bg-muted px-1 py-0.5 rounded">LITELLM_MASTER_KEY</code></li>
                      <li>Klistra in din master key som värde</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkStatus} disabled={checking} variant="outline" size="sm">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checking ? "animate-spin" : ""}`} />
                Kontrollera igen
              </Button>
            </div>

            {/* Future proxy support */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Plus className="w-3.5 h-3.5" />
                <span>Stöd för fler LLM-proxies (OpenRouter, Custom OpenAI-compatible) kommer i framtida versioner.</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
