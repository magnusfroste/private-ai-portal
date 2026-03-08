import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useKeyManagement } from "./hooks/useKeyManagement";
import { apiKeyService } from "@/models/services/apiKeyService";
import { UsageStats } from "./components/UsageStats";
import { ApiKeyList } from "./components/ApiKeyList";
import { IntegrationGuide } from "./components/IntegrationGuide";
import { AvailableModels } from "./components/AvailableModels";
import { Badge } from "@/components/ui/badge";

export const DashboardActivity = () => {
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

  const totalCredits = apiKeyService.calculateTotalCredits(apiKeys, keyUsageData);
  const usedCredits = apiKeyService.calculateUsedCredits(apiKeys, keyUsageData);
  const remainingCredits = apiKeyService.calculateRemainingCredits(apiKeys, keyUsageData);

  const canCreateMore = profile ? profile.trial_keys_created < profile.max_trial_keys : false;
  const remainingKeys = profile ? profile.max_trial_keys - profile.trial_keys_created : 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {profile?.full_name || "Developer"}
          </h1>
          <p className="text-muted-foreground text-sm">{profile?.email}</p>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Trial Keys: <span className="font-semibold text-foreground">
                {profile.trial_keys_created}/{profile.max_trial_keys}
              </span>
            </div>
            {profile.trial_keys_created >= profile.max_trial_keys && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Limit Reached
              </Badge>
            )}
          </div>
        )}
      </div>

      <UsageStats
        totalCredits={totalCredits}
        usedCredits={usedCredits}
        remainingCredits={remainingCredits}
      />

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

      <AvailableModels />
      <IntegrationGuide onCopy={copyToClipboard} />
    </div>
  );
};
