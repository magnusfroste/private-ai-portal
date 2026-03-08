import { useState } from "react";
import { Filter } from "lucide-react";
import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useActivityData, TimePeriod, GroupBy } from "./hooks/useActivityData";
import { ActivityStatCard } from "./components/ActivityStatCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (v: number) => `$${v.toFixed(4)}`;
const formatTokens = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

const periodOptions: { value: TimePeriod; label: string }[] = [
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
];

const groupOptions: { value: GroupBy; label: string }[] = [
  { value: "model", label: "By Model" },
  { value: "key", label: "By Key" },
];

export const DashboardActivity = () => {
  const { loading: profileLoading } = useProfile();
  const {
    apiKeys,
    loading: keysLoading,
    keyUsageData,
    spendLogs,
  } = useDashboardData();

  const [period, setPeriod] = useState<TimePeriod>("1m");
  const [groupBy, setGroupBy] = useState<GroupBy>("model");

  const activity = useActivityData(spendLogs, keyUsageData, period, groupBy, apiKeys);

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your usage across models on Autoversio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </Button>

          <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
