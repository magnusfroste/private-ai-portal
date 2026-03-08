import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAccountData } from "./hooks/useAccountData";
import { ProfileSection } from "./components/ProfileSection";
import { SubscriptionSection } from "./components/SubscriptionSection";
import { UsageOverview } from "./components/UsageOverview";

export const AccountPage = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { usageByModel, totalSpend, loading: usageLoading } = useAccountData();

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
