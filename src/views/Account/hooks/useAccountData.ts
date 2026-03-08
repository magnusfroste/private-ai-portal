import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelUsage } from "@/models/types/usage.types";

export const useAccountData = () => {
  const [usageByModel, setUsageByModel] = useState<ModelUsage[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get all user's API keys
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

      // Fetch usage from LiteLLM for each key
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

            // Aggregate from key info spend
            const keySpend = data.info?.spend || 0;
            const keyTokens = data.info?.total_tokens || 0;

            // Use spend_logs for per-model breakdown
            const logs = data.spend_logs || [];
            if (logs.length > 0) {
              logs.forEach((log: any) => {
                const model = log.model || "unknown";
                if (!modelMap[model]) {
                  modelMap[model] = { model, cost: 0, tokens: 0, requests: 0 };
                }
                modelMap[model].cost += Number(log.spend || 0);
                modelMap[model].tokens += Number(log.total_tokens || 0);
                modelMap[model].requests += 1;
              });
              total += logs.reduce((s: number, l: any) => s + (l.spend || 0), 0);
            } else if (keySpend > 0) {
              // Fallback: no logs but key has spend — show as single entry
              const fallbackModel = "aggregated";
              if (!modelMap[fallbackModel]) {
                modelMap[fallbackModel] = { model: fallbackModel, cost: 0, tokens: 0, requests: 0 };
              }
              modelMap[fallbackModel].cost += keySpend;
              modelMap[fallbackModel].tokens += keyTokens;
              modelMap[fallbackModel].requests += 1;
              total += keySpend;
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
  };

  return { usageByModel, totalSpend, loading };
};
