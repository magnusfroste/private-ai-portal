import { useMemo } from "react";
import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { useRequestLogs } from "./hooks/useRequestLogs";
import { KeyEventLog } from "./components/KeyEventLog";
import { RequestLogTable } from "./components/RequestLogTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export const LogsPage = () => {
  const { apiKeys } = useDashboardData();
  const { logs: requestLogs, loading: logsLoading } = useRequestLogs();

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
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Logs</h1>
        <p className="text-muted-foreground text-sm">API-anrop och nyckel-händelser</p>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">
            API-anrop
            {requestLogs.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({requestLogs.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="keys">
            Nyckel-händelser
            {keyEvents.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({keyEvents.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : requestLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Inga API-anrop hittades</p>
          ) : (
            <RequestLogTable logs={requestLogs} />
          )}
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          {keyEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Inga nyckel-händelser</p>
          ) : (
            <KeyEventLog keys={keyEvents} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
