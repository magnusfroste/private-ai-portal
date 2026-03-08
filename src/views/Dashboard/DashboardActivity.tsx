import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useActivityData } from "./hooks/useActivityData";
import { ActivityStatCard } from "./components/ActivityStatCard";

const formatCurrency = (v: number) => `$${v.toFixed(4)}`;
const formatTokens = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

export const DashboardActivity = () => {
  const { profile, loading: profileLoading } = useProfile();
  const {
    loading: keysLoading,
    keyUsageData,
    spendLogs,
  } = useDashboardData();

  const activity = useActivityData(spendLogs, keyUsageData);

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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Activity</h1>
      <p className="text-sm text-muted-foreground">
        Your usage across models on Autoversio
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityStatCard
          title="Spend"
          value={`$${activity.totalSpend.toFixed(3)}`}
          chartData={activity.chartDataSpend}
          modelBreakdowns={activity.spendBreakdowns}
          formatValue={formatCurrency}
        />
        <ActivityStatCard
          title="Requests"
          value={activity.totalRequests.toLocaleString()}
          chartData={activity.chartDataRequests}
          modelBreakdowns={activity.requestBreakdowns}
          formatValue={(v) => v.toLocaleString()}
        />
        <ActivityStatCard
          title="Tokens"
          value={formatTokens(activity.totalTokens)}
          chartData={activity.chartDataTokens}
          modelBreakdowns={activity.tokenBreakdowns}
          formatValue={formatTokens}
        />
      </div>
    </div>
  );
};
