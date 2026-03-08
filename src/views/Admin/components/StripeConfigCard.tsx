import { useState } from "react";
import { CreditCard, RefreshCw, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StripeStatus {
  connected: boolean;
  error?: string;
  account?: {
    id: string;
    business_name: string;
    country: string;
    default_currency: string;
    email: string;
  };
  balance?: {
    available: number;
    pending: number;
    currency: string;
  };
  has_customers: boolean;
  key_prefix?: string;
}

export const StripeConfigCard = () => {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-status");
      if (error) throw error;
      setStatus(data as StripeStatus);
    } catch (err) {
      console.error("Stripe status error:", err);
      toast.error("Kunde inte hämta Stripe-status");
      setStatus({ connected: false, error: "Kunde inte ansluta", has_customers: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Stripe-konfiguration
        </CardTitle>
        <CardDescription>
          Kontrollera anslutning och kontostatus för Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status ? (
          <Button onClick={checkStatus} disabled={loading} variant="outline" className="w-full md:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Kontrollerar..." : "Kontrollera Stripe-anslutning"}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-3">
              {status.connected ? (
                <Badge variant="default" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ansluten
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Ej ansluten
                </Badge>
              )}
              {status.key_prefix && (
                <span className="text-xs text-muted-foreground font-mono">
                  Nyckel: {status.key_prefix}
                </span>
              )}
            </div>

            {status.error && !status.connected && (
              <p className="text-sm text-destructive">{status.error}</p>
            )}

            {status.connected && status.account && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Konto-ID</p>
                    <p className="font-mono text-xs">{status.account.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Företagsnamn</p>
                    <p className="font-medium">{status.account.business_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Land</p>
                    <p>{status.account.country}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Valuta</p>
                    <p>{status.account.default_currency}</p>
                  </div>
                  {status.account.email && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">E-post</p>
                      <p>{status.account.email}</p>
                    </div>
                  )}
                </div>

                {status.balance && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Tillgängligt saldo</p>
                        <p className="font-bold text-primary">
                          ${status.balance.available.toFixed(2)} {status.balance.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Väntande</p>
                        <p className="font-medium">
                          ${status.balance.pending.toFixed(2)} {status.balance.currency}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button onClick={checkStatus} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Uppdatera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Stripe Dashboard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Behöver du byta Stripe-konto? Uppdatera STRIPE_SECRET_KEY via Lovable Cloud-inställningarna.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
