import { useEffect, useRef } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAccountData } from "./hooks/useAccountData";
import { ProfileSection } from "./components/ProfileSection";
import { SubscriptionSection } from "./components/SubscriptionSection";
import { UsageOverview } from "./components/UsageOverview";
import { supabase } from "@/integrations/supabase/client";

export const AccountPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { usageByModel, totalSpend, loading: usageLoading } = useAccountData();
  const verifiedRef = useRef(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId && !verifiedRef.current) {
      verifiedRef.current = true;
      toast.loading("Verifying payment...", { id: "verify-payment" });

      supabase.functions
        .invoke("verify-payment", { body: { session_id: sessionId } })
        .then(({ data, error }) => {
          if (error || data?.error) {
            toast.error("Could not verify payment. Contact support if credits are missing.", { id: "verify-payment" });
          } else if (data?.status === "paid") {
            toast.success(`Payment verified! ${data.credits_added} credits added.`, { id: "verify-payment" });
            refetchProfile();
          } else {
            toast.info("Payment not yet completed.", { id: "verify-payment" });
          }
        });

      // Clean up URL params
      setSearchParams({});
    } else if (payment === "canceled") {
      toast.info("Payment was canceled.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, refetchProfile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Autoversio</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, plan, and usage</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <ProfileSection profile={profile} onUpdated={refetchProfile} />
            <UsageOverview usageByModel={usageByModel} totalSpend={totalSpend} loading={usageLoading} />
          </div>
          <div>
            <SubscriptionSection profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
};
