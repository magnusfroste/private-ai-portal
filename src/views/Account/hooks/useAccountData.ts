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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("token_usage")
        .select("model, cost_usd, tokens_used")
        .eq("user_id", user.id);

      if (error) throw error;

      // Aggregate by model
      const modelMap: Record<string, ModelUsage> = {};
      let total = 0;

      (data || []).forEach((row) => {
        const model = row.model || "unknown";
        if (!modelMap[model]) {
          modelMap[model] = { model, cost: 0, tokens: 0, requests: 0 };
        }
        modelMap[model].cost += Number(row.cost_usd);
        modelMap[model].tokens += Number(row.tokens_used);
        modelMap[model].requests += 1;
        total += Number(row.cost_usd);
      });

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
