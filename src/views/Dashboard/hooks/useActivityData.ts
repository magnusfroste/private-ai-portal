import { useMemo } from "react";
import { SpendLog, KeyUsageInfo } from "@/models/types/apiKey.types";
import { ApiKey } from "@/models/types/apiKey.types";
import { getModelColor, ModelBreakdown } from "../components/ActivityStatCard";

export type TimePeriod = "1w" | "1m" | "3m";
export type GroupBy = "model" | "key";

interface AggregatedData {
  label: string;
  spend: number;
  requests: number;
  tokens: number;
}

const getPeriodStartDate = (period: TimePeriod): Date => {
  const now = new Date();
  switch (period) {
    case "1w":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
};

export const useActivityData = (
  spendLogs: Record<string, SpendLog[]>,
  keyUsageData: Record<string, KeyUsageInfo>,
  period: TimePeriod = "1m",
  groupBy: GroupBy = "model",
  apiKeys: ApiKey[] = []
) => {
  return useMemo(() => {
    const periodStart = getPeriodStartDate(period);

    // Flatten and filter by period
    const allLogs: (SpendLog & { keyId: string })[] = [];
    for (const [keyId, logs] of Object.entries(spendLogs)) {
      for (const log of logs) {
        const logDate = new Date(log.startTime);
        if (logDate >= periodStart) {
          allLogs.push({ ...log, keyId });
        }
      }
    }

    // Build key name lookup
    const keyNameMap = new Map<string, string>();
    for (const key of apiKeys) {
      keyNameMap.set(key.id, key.name);
    }

    // Aggregate by group
    const groupMap = new Map<string, AggregatedData>();
    for (const log of allLogs) {
      const label =
        groupBy === "model"
          ? log.model || "unknown"
          : keyNameMap.get(log.keyId) || log.keyId.slice(0, 8);
      const existing = groupMap.get(label) || { label, spend: 0, requests: 0, tokens: 0 };
      existing.spend += log.spend;
      existing.requests += 1;
      existing.tokens += log.total_tokens;
      groupMap.set(label, existing);
    }

    const groups = Array.from(groupMap.values()).sort((a, b) => b.spend - a.spend);

    // Top 3 + Others
    const top3 = groups.slice(0, 3);
    const others = groups.slice(3);
    const othersAgg: AggregatedData | null =
      others.length > 0
        ? {
            label: "Others",
            spend: others.reduce((s, m) => s + m.spend, 0),
            requests: others.reduce((s, m) => s + m.requests, 0),
            tokens: others.reduce((s, m) => s + m.tokens, 0),
          }
        : null;

    const displayGroups = othersAgg ? [...top3, othersAgg] : top3;

    const buildBreakdowns = (key: "spend" | "requests" | "tokens"): ModelBreakdown[] =>
      displayGroups.map((m, i) => ({
        model: m.label,
        value: m[key],
        color: getModelColor(i),
      }));

    // Helper to build chart data
    const buildChartData = (valueFn: (log: SpendLog & { keyId: string }) => number) => {
      const dayMap = new Map<string, Record<string, number>>();
      for (const log of allLogs) {
        const day = log.startTime?.slice(0, 10) || "unknown";
        if (!dayMap.has(day)) dayMap.set(day, {});
        const bucket = dayMap.get(day)!;
        const rawLabel =
          groupBy === "model"
            ? log.model || "unknown"
            : keyNameMap.get(log.keyId) || log.keyId.slice(0, 8);
        const displayName = top3.find((m) => m.label === rawLabel)
          ? rawLabel
          : others.length > 0
          ? "Others"
          : rawLabel;
        bucket[displayName] = (bucket[displayName] || 0) + valueFn(log);
      }
      return Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));
    };

    const chartDataSpend = buildChartData((log) => log.spend);
    const chartDataRequests = buildChartData(() => 1);
    const chartDataTokens = buildChartData((log) => log.total_tokens);

    // Totals (filtered)
    const totalSpend = allLogs.reduce((s, l) => s + l.spend, 0);
    const totalRequests = allLogs.length;
    const totalTokens = allLogs.reduce((s, l) => s + l.total_tokens, 0);

    return {
      totalSpend,
      totalRequests,
      totalTokens,
      spendBreakdowns: buildBreakdowns("spend"),
      requestBreakdowns: buildBreakdowns("requests"),
      tokenBreakdowns: buildBreakdowns("tokens"),
      chartDataSpend,
      chartDataRequests,
      chartDataTokens,
      displayModelNames: displayGroups.map((m) => m.label),
    };
  }, [spendLogs, keyUsageData, period, groupBy, apiKeys]);
};
