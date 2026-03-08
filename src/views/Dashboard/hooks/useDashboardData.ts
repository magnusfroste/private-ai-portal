import { useState, useEffect } from "react";
import { apiKeyService } from "@/models/services/apiKeyService";
import { ApiKey } from "@/models/types/apiKey.types";

export const useDashboardData = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getKeysForCurrentUser();
      setApiKeys(keys);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    apiKeys,
    loading,
    refetch: loadData,
  };
};
