import { useDashboardData } from "@/views/Dashboard/hooks/useDashboardData";
import { SpendLogTable } from "@/views/Dashboard/components/SpendLogTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const LogsPage = () => {
  const { apiKeys, spendLogs, refreshAllUsage } = useDashboardData();

  const allLogs = Object.values(spendLogs).flat().sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Logs</h1>
          <p className="text-muted-foreground text-sm">API request history across all keys</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAllUsage}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {allLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No logs yet</p>
      ) : (
        <SpendLogTable logs={allLogs} />
      )}
    </div>
  );
};
