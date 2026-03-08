import { useMemo } from "react";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { KeyEventLog } from "./components/KeyEventLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LogsPage = () => {
  const { apiKeys } = useDashboardData();

  // Key events (revoked/expired)
  const keyEvents = useMemo(() => {
    return apiKeys
      .filter((k) => !k.is_active || !!k.revoked_at || (k.expires_at && new Date(k.expires_at) < new Date()))
      .sort((a, b) => {
        const dateA = a.revoked_at || a.expires_at || a.created_at;
        const dateB = b.revoked_at || b.expires_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }, [apiKeys]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Logs</h1>
        <p className="text-muted-foreground text-sm">Key events and history</p>
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">
            Key Events
            {keyEvents.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({keyEvents.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4">
          {keyEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No key events</p>
          ) : (
            <KeyEventLog keys={keyEvents} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
