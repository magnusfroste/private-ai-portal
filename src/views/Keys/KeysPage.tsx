import { useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { useKeyManagement } from "@/views/Dashboard/hooks/useKeyManagement";
import { useUserBudget } from "@/hooks/useUserBudget";
import { ApiKeyList } from "@/views/Dashboard/components/ApiKeyList";
import { UserBudgetCard } from "@/views/Dashboard/components/UserBudgetCard";
import { ApiKey } from "@/models/types/apiKey.types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const KeysPage = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [syncing, setSyncing] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { budget, loading: budgetLoading, refetch: refetchBudget } = useUserBudget();
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('sync-keys', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data.deactivated?.length > 0) {
        toast.success(`Synced: ${data.deactivated.length} key(s) marked inactive`);
        await refetch();
      } else {
        toast.success(`All ${data.synced} keys are in sync`);
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error("Failed to sync keys");
    } finally {
      setSyncing(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    setRevoking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('revoke-key', {
        body: { keyId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast.success(`Key "${data.name}" has been revoked`);
      await refetch();
    } catch (err) {
      console.error("Revoke error:", err);
      toast.error("Failed to revoke key");
    } finally {
      setRevoking(false);
    }
  };

  const canCreateMore = profile ? profile.trial_keys_created < profile.max_trial_keys : false;
  const remainingKeys = profile ? profile.max_trial_keys - profile.trial_keys_created : 0;

  // Only show active keys
  const activeKeys = apiKeys.filter((key: ApiKey) => key.is_active && !key.revoked_at && !isExpired(key));

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">API Keys</h1>
          <p className="text-muted-foreground text-sm">Manage your active API keys</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync with LiteLLM"}
        </Button>
      </div>

      <ApiKeyList
        apiKeys={activeKeys}
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
        onRevoke={handleRevoke}
        isRevoking={revoking}
      />
    </div>
  );
};

function isExpired(key: ApiKey): boolean {
  if (!key.expires_at) return false;
  return new Date(key.expires_at) < new Date();
}
