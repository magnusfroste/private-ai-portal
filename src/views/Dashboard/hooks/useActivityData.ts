import { useMemo } from "react";
import { SpendLog, KeyUsageInfo } from "@/models/types/apiKey.types";
import { getModelColor, ModelBreakdown } from "../components/ActivityStatCard";

interface AggregatedModelData {
  model: string;
  spend: number;
  requests: number;
  tokens: number;
}

export const useActivityData = (
  spendLogs: Record<string, SpendLog[]>,
  keyUsageData: Record<string, KeyUsageInfo>
) => {
  return useMemo(() => {
    // Flatten all spend logs
    const allLogs = Object.values(spendLogs).flat();

    // Aggregate by model
    const modelMap = new Map<string, AggregatedModelData>();
    for (const log of allLogs) {
      const name = log.model || "unknown";
      const existing = modelMap.get(name) || { model: name, spend: 0, requests: 0, tokens: 0 };
      existing.spend += log.spend;
      existing.requests += 1;
      existing.tokens += log.total_tokens;
      modelMap.set(name, existing);
    }

    const models = Array.from(modelMap.values()).sort((a, b) => b.spend - a.spend);

    // Top 3 + Others
    const top3 = models.slice(0, 3);
    const others = models.slice(3);
    const othersAgg: AggregatedModelData | null = others.length > 0
      ? {
          model: "Others",
          spend: others.reduce((s, m) => s + m.spend, 0),
          requests: others.reduce((s, m) => s + m.requests, 0),
          tokens: others.reduce((s, m) => s + m.tokens, 0),
        }
      : null;

    const displayModels = othersAgg ? [...top3, othersAgg] : top3;

    // Build breakdowns
    const buildBreakdowns = (
      key: "spend" | "requests" | "tokens"
    ): ModelBreakdown[] =>
      displayModels.map((m, i) => ({
        model: m.model,
        value: m[key],
        color: getModelColor(i),
      }));

    // Build chart data grouped by day
    const dayMap = new Map<string, Record<string, number>>();
    for (const log of allLogs) {
      const day = log.startTime?.slice(0, 10) || "unknown";
      if (!dayMap.has(day)) dayMap.set(day, {});
      const bucket = dayMap.get(day)!;
      const modelName = log.model || "unknown";
      // Map to display name (if in Others, map to "Others")
      const displayName = top3.find((m) => m.model === modelName)
        ? modelName
        : others.length > 0
        ? "Others"
        : modelName;
      bucket[displayName] = (bucket[displayName] || 0) + 1;
    }

    const chartDataRequests = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    // Spend chart
    const daySpendMap = new Map<string, Record<string, number>>();
    for (const log of allLogs) {
      const day = log.startTime?.slice(0, 10) || "unknown";
      if (!daySpendMap.has(day)) daySpendMap.set(day, {});
      const bucket = daySpendMap.get(day)!;
      const modelName = log.model || "unknown";
      const displayName = top3.find((m) => m.model === modelName)
        ? modelName
        : others.length > 0
        ? "Others"
        : modelName;
      bucket[displayName] = (bucket[displayName] || 0) + log.spend;
    }

    const chartDataSpend = Array.from(daySpendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    // Tokens chart
    const dayTokenMap = new Map<string, Record<string, number>>();
    for (const log of allLogs) {
      const day = log.startTime?.slice(0, 10) || "unknown";
      if (!dayTokenMap.has(day)) dayTokenMap.set(day, {});
      const bucket = dayTokenMap.get(day)!;
      const modelName = log.model || "unknown";
      const displayName = top3.find((m) => m.model === modelName)
        ? modelName
        : others.length > 0
        ? "Others"
        : modelName;
      bucket[displayName] = (bucket[displayName] || 0) + log.total_tokens;
    }

    const chartDataTokens = Array.from(dayTokenMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    // Totals
    const totalSpend = Object.values(keyUsageData).reduce((s, k) => s + (k.spend || 0), 0);
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
      displayModelNames: displayModels.map((m) => m.model),
    };
  }, [spendLogs, keyUsageData]);
};
