import { useState, useEffect, useRef } from "react";
import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { useKeyManagement } from "@/views/Dashboard/hooks/useKeyManagement";
import { ApiKeyList } from "@/views/Dashboard/components/ApiKeyList";
import { ApiKey } from "@/models/types/apiKey.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const KeysPage = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [revoking, setRevoking] = useState(false);
  const { apiKeys, loading: keysLoading, refetch } = useDashboardData();
  const { createKey, isCreatingKey, copyToClipboard } = useKeyManagement();
  const syncRan = useRef(false);

  // Auto-sync keys with LiteLLM on page load
  useEffect(() => {
    if (keysLoading || syncRan.current) return;
    syncRan.current = true;

    const autoSync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase.functions.invoke('sync-keys', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error) {
          console.error("Auto-sync error:", error);
          return;
        }

        if (data.deactivated?.length > 0) {
          toast.info(`${data.deactivated.length} nyckel/nycklar inaktiverade (ej längre giltiga)`);
          await refetch();
        }
      } catch (err) {
        console.error("Auto-sync error:", err);
      }
    };

    autoSync();
  }, [keysLoading, refetch]);

  const handleCreateKey = async (name: string, models: string[]) => {
    const success = await createKey(name, models);
    if (success) await refetch();
    return success;
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

  const canCreateMore = true;
  const remainingKeys = 0;

  const activeKeys = apiKeys.filter((key: ApiKey) => key.is_active && !key.revoked_at);

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
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">API Keys</h1>
        <p className="text-muted-foreground text-sm">Manage your active API keys</p>
      </div>

      <ApiKeyList
        apiKeys={activeKeys}
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

