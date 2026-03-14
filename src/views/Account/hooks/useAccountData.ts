import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelUsage } from "@/models/types/usage.types";

interface UseAccountDataOptions {
  startDate?: Date;
  endDate?: Date;
}

export const useAccountData = (options?: UseAccountDataOptions) => {
  const [usageByModel, setUsageByModel] = useState<ModelUsage[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const startIso = options?.startDate?.toISOString();
  const endIso = options?.endDate?.toISOString();

  const fetchUsageData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: keys, error: keysError } = await supabase
        .from("api_keys")
        .select("id, name")
        .eq("user_id", session.user.id);

      if (keysError) throw keysError;
      if (!keys || keys.length === 0) {
        setUsageByModel([]);
        setTotalSpend(0);
        return;
      }

      const modelMap: Record<string, ModelUsage> = {};
      let total = 0;

      await Promise.all(
        keys.map(async (key) => {
          try {
            const { data, error } = await supabase.functions.invoke("get-key-usage", {
              body: { keyId: key.id },
              headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (error || !data) return;

            const logs = data.spend_logs || [];
            const filteredLogs = logs.filter((log: any) => {
              if (!log.startTime) return true;
              const logDate = new Date(log.startTime);
              if (startIso && logDate < new Date(startIso)) return false;
              if (endIso) {
                const end = new Date(endIso);
                end.setHours(23, 59, 59, 999);
                if (logDate > end) return false;
              }
              return true;
            });

            if (filteredLogs.length > 0) {
              filteredLogs.forEach((log: any) => {
                const model = log.model || "unknown";
                if (!modelMap[model]) {
                  modelMap[model] = { model, cost: 0, tokens: 0, requests: 0 };
                }
                modelMap[model].cost += Number(log.spend || 0);
                modelMap[model].tokens += Number(log.total_tokens || 0);
                modelMap[model].requests += 1;
              });
              total += filteredLogs.reduce((s: number, l: any) => s + (l.spend || 0), 0);
            } else if (!startIso && !endIso) {
              // Fallback only when no date filter
              const keySpend = data.info?.spend || 0;
              const keyTokens = data.info?.total_tokens || 0;
              if (keySpend > 0) {
                const fallbackModel = "aggregated";
                if (!modelMap[fallbackModel]) {
                  modelMap[fallbackModel] = { model: fallbackModel, cost: 0, tokens: 0, requests: 0 };
                }
                modelMap[fallbackModel].cost += keySpend;
                modelMap[fallbackModel].tokens += keyTokens;
                modelMap[fallbackModel].requests += 1;
                total += keySpend;
              }
            }
          } catch (err) {
            console.error(`Error fetching usage for key ${key.name}:`, err);
          }
        })
      );

      const sorted = Object.values(modelMap).sort((a, b) => b.cost - a.cost);
      setUsageByModel(sorted);
      setTotalSpend(total);
    } catch (err) {
      console.error("Error fetching usage data:", err);
    } finally {
      setLoading(false);
    }
  }, [startIso, endIso]);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return { usageByModel, totalSpend, loading };
};
