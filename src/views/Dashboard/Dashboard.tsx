import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useKeyManagement } from "./hooks/useKeyManagement";
import { useUserBudget } from "@/hooks/useUserBudget";

import { UserBudgetCard } from "./components/UserBudgetCard";
import { ApiKeyList } from "./components/ApiKeyList";
import { IntegrationGuide } from "./components/IntegrationGuide";
import { AvailableModels } from "./components/AvailableModels";

const Dashboard = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { apiKeys, loading: keysLoading, refetch } = useDashboardData();
  const { createKey, isCreatingKey, copyToClipboard } = useKeyManagement();
  const { budget, loading: budgetLoading, refetch: refetchBudget } = useUserBudget();

  const handleCreateKey = async (name: string, models: string[]) => {
    const success = await createKey(name, models);
    if (success) {
      await refetch();
    }
    return success;
  };

  const canCreateMore = true;
  const remainingKeys = 0;

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
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {profile?.full_name || "Developer"}
        </h1>
        <p className="text-muted-foreground text-sm">{profile?.email}</p>
      </div>

      <UserBudgetCard budget={budget} loading={budgetLoading} onRefresh={refetchBudget} />

      <ApiKeyList
        apiKeys={apiKeys}
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
