import { useEffect } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useKeyManagement } from "./hooks/useKeyManagement";
import { apiKeyService } from "@/models/services/apiKeyService";
import { DashboardHeader } from "./components/DashboardHeader";
import { UsageStats } from "./components/UsageStats";
import { ApiKeyList } from "./components/ApiKeyList";
import { IntegrationGuide } from "./components/IntegrationGuide";
import { AvailableModels } from "./components/AvailableModels";

const Dashboard = () => {
  const { checkAuth, signOut } = useAuth();
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

  useEffect(() => {
    checkAuth();
  }, []);

  const handleCreateKey = async (name: string, models: string[]) => {
    const success = await createKey(name, models);
    if (success) {
      await refetch();
    }
    return success;
  };

  const totalCredits = apiKeyService.calculateTotalCredits(apiKeys, keyUsageData);
  const usedCredits = apiKeyService.calculateUsedCredits(apiKeys, keyUsageData);
  const remainingCredits = apiKeyService.calculateRemainingCredits(apiKeys, keyUsageData);

  const canCreateMore = profile 
    ? profile.trial_keys_created < profile.max_trial_keys 
    : false;
  const remainingKeys = profile 
    ? profile.max_trial_keys - profile.trial_keys_created 
    : 0;

  if (profileLoading || keysLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader profile={profile} onSignOut={signOut} />
      
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

export default Dashboard;
