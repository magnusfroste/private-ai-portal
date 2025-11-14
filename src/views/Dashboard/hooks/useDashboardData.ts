import { useState, useEffect } from "react";
import { apiKeyService } from "@/models/services/apiKeyService";
import { usageRepository } from "@/data/repositories/usageRepository";
import { ApiKey, KeyUsageInfo, SpendLog } from "@/models/types/apiKey.types";
import { toast } from "sonner";

export const useDashboardData = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyUsageData, setKeyUsageData] = useState<Record<string, KeyUsageInfo>>({});
  const [loadingUsage, setLoadingUsage] = useState<Record<string, boolean>>({});
  const [spendLogs, setSpendLogs] = useState<Record<string, SpendLog[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getKeysForCurrentUser();
      setApiKeys(keys);
      
      // Fetch usage data for all keys
      if (keys.length > 0) {
        keys.forEach(key => fetchKeyUsage(key.id));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeyUsage = async (keyId: string) => {
    setLoadingUsage(prev => ({ ...prev, [keyId]: true }));
    try {
      const data = await usageRepository.fetchKeyUsage(keyId);
      
      if (data && data.info) {
        setKeyUsageData(prev => ({ ...prev, [keyId]: data.info }));
        if (data.spend_logs) {
          setSpendLogs(prev => ({ ...prev, [keyId]: data.spend_logs }));
        }
      }
    } catch (error) {
      console.error("Error fetching key usage:", error);
    } finally {
      setLoadingUsage(prev => ({ ...prev, [keyId]: false }));
    }
  };

  const refreshAllUsage = async () => {
    apiKeys.forEach(key => fetchKeyUsage(key.id));
    toast.success("Refreshing usage data...");
  };

  const refreshKeyUsage = (keyId: string) => {
    fetchKeyUsage(keyId);
  };

  return {
    apiKeys,
    loading,
    keyUsageData,
    loadingUsage,
    spendLogs,
    refreshAllUsage,
    refreshKeyUsage,
    refetch: loadData,
  };
};
