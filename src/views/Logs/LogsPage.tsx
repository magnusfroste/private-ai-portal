import { useRequestLogs } from "./hooks/useRequestLogs";
import { RequestLogTable } from "./components/RequestLogTable";
import { Loader2 } from "lucide-react";

export const LogsPage = () => {
  const { logs: requestLogs, loading: logsLoading } = useRequestLogs();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Logs</h1>
        <p className="text-muted-foreground text-sm">
          API-anrop
          {requestLogs.length > 0 && (
            <span className="ml-1.5 text-xs">({requestLogs.length})</span>
          )}
        </p>
      </div>

      {logsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : requestLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">Inga API-anrop hittades</p>
      ) : (
        <RequestLogTable logs={requestLogs} />
      )}
    </div>
  );
};
