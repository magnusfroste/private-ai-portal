import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { useKeyManagement } from "@/views/Dashboard/hooks/useKeyManagement";
import { apiKeyService } from "@/models/services/apiKeyService";
import { ApiKeyList } from "@/views/Dashboard/components/ApiKeyList";

export const KeysPage = () => {
  const { profile, loading: profileLoading } = useProfile();
  const {
    apiKeys,
    loading: keysLoading,
    keyUsageData,
    loadingUsage,
    spendLogs,
    refreshAllUsage,
    refreshKeyUsage,
    refetch,
  } = useDashboardData();
  const { createKey, isCreatingKey, copyToClipboard } = useKeyManagement();

  const handleCreateKey = async (name: string, models: string[]) => {
    const success = await createKey(name, models);
    if (success) await refetch();
    return success;
  };

  const canCreateMore = profile ? profile.trial_keys_created < profile.max_trial_keys : false;
  const remainingKeys = profile ? profile.max_trial_keys - profile.trial_keys_created : 0;

  if (profileLoading || keysLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">API Keys</h1>
        <p className="text-muted-foreground text-sm">Manage your API keys</p>
      </div>

      <ApiKeyList
        apiKeys={apiKeys}
        keyUsageData={keyUsageData}
        loadingUsage={loadingUsage}
        spendLogs={spendLogs}
        onRefreshAll={refreshAllUsage}
        onRefreshKey={refreshKeyUsage}
        onCopy={copyToClipboard}
        onCreateKey={handleCreateKey}
        isCreatingKey={isCreatingKey}
        canCreateMore={canCreateMore}
        remainingKeys={remainingKeys}
      />
    </div>
  );
};
