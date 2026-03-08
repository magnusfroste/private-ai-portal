import { useMemo } from "react";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { SpendLogTable } from "@/views/Dashboard/components/SpendLogTable";
import { KeyEventLog } from "./components/KeyEventLog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LogsPage = () => {
  const { apiKeys, spendLogs, refreshAllUsage } = useDashboardData();

  // Build key name lookup
  const keyNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const key of apiKeys) {
      map[key.id] = key.name;
    }
    return map;
  }, [apiKeys]);

  // Flatten logs with key name
  const allLogs = useMemo(() => {
    const logs: Array<{ keyId: string; keyName: string; log: (typeof flatLogs)[0] }> = [];
    for (const [keyId, keyLogs] of Object.entries(spendLogs)) {
      for (const log of keyLogs) {
        logs.push({
          keyId,
          keyName: keyNameMap[keyId] || keyId.slice(0, 8),
          log,
        });
      }
    }
    return logs.sort((a, b) => new Date(b.log.startTime).getTime() - new Date(a.log.startTime).getTime());
  }, [spendLogs, keyNameMap]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Logs</h1>
          <p className="text-muted-foreground text-sm">API request history and key events</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAllUsage}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="keys">
            Key Events
            {keyEvents.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({keyEvents.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          {allLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No logs yet</p>
          ) : (
            <SpendLogTable
              logs={allLogs.map((l) => l.log)}
              keyNames={allLogs.reduce((acc, l) => {
                // Map request_id to key name for the table
                acc[l.log.request_id] = l.keyName;
                return acc;
              }, {} as Record<string, string>)}
            />
          )}
        </TabsContent>

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
