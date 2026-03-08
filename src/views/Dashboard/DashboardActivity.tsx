import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useAccountData } from "@/views/Account/hooks/useAccountData";
import { ActivityCard } from "./components/ActivityCard";

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

  const totalRequests = usageByModel.reduce((s, m) => s + m.requests, 0);
  const totalTokens = usageByModel.reduce((s, m) => s + m.tokens, 0);

  const spendData = usageByModel.map((m) => ({ name: m.model, value: m.cost }));
  const requestData = usageByModel
    .map((m) => ({ name: m.model, value: m.requests }))
    .sort((a, b) => b.value - a.value);
  const tokenData = usageByModel
    .map((m) => ({ name: m.model, value: m.tokens }))
    .sort((a, b) => b.value - a.value);

  const formatTokens = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v.toString();

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your usage across models on Autoversio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          title="Spend"
          value={`$${totalSpend.toFixed(3)}`}
          data={spendData}
          formatLegend={(v) => v.toFixed(4)}
        />
        <ActivityCard
          title="Requests"
          value={totalRequests.toLocaleString()}
          data={requestData}
          formatLegend={(v) => v.toLocaleString()}
        />
        <ActivityCard
          title="Tokens"
          value={formatTokens(totalTokens)}
          data={tokenData}
          formatLegend={formatTokens}
        />
      </div>
    </div>
  );
};
