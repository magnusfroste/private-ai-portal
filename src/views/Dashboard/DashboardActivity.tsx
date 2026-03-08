import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useAccountData } from "@/views/Account/hooks/useAccountData";
import { UsageOverview } from "@/views/Account/components/UsageOverview";

export const DashboardActivity = () => {
  const { loading: profileLoading } = useProfile();
  const { loading: keysLoading } = useDashboardData();
  const { usageByModel, totalSpend, loading: usageLoading } = useAccountData();

  if (profileLoading || keysLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your API usage across models.
        </p>
      </div>

      <UsageOverview usageByModel={usageByModel} totalSpend={totalSpend} loading={usageLoading} />
    </div>
  );
};
