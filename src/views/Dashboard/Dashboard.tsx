import { useEffect } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";
import { useKeyManagement } from "./hooks/useKeyManagement";
import { useUserBudget } from "@/hooks/useUserBudget";
import { DashboardHeader } from "./components/DashboardHeader";
import { UserBudgetCard } from "./components/UserBudgetCard";
import { ApiKeyList } from "./components/ApiKeyList";
import { IntegrationGuide } from "./components/IntegrationGuide";
import { AvailableModels } from "./components/AvailableModels";

const Dashboard = () => {
  const { checkAuth, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { apiKeys, loading: keysLoading, refetch } = useDashboardData();
  const { createKey, isCreatingKey, copyToClipboard } = useKeyManagement();
  const { budget, loading: budgetLoading, refetch: refetchBudget } = useUserBudget();

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
    <div className="min-h-screen">
      <DashboardHeader profile={profile} onSignOut={signOut} />
      
      <div className="container mx-auto px-4 py-6">
        <UserBudgetCard budget={budget} loading={budgetLoading} onRefresh={refetchBudget} />
      </div>

      <div className="container mx-auto px-4 pb-8">
        <ApiKeyList
          apiKeys={apiKeys}
          onCopy={copyToClipboard}
          onCreateKey={handleCreateKey}
          isCreatingKey={isCreatingKey}
          canCreateMore={canCreateMore}
          remainingKeys={remainingKeys}
        />
      </div>

      <AvailableModels />

      <IntegrationGuide onCopy={copyToClipboard} />
    </div>
  );
};

export default Dashboard;
