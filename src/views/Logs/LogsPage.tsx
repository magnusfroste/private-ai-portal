import { useState, useMemo } from "react";
import { useRequestLogs } from "./hooks/useRequestLogs";
import { RequestLogTable } from "./components/RequestLogTable";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LogsPage = () => {
  const { logs: requestLogs, loading: logsLoading } = useRequestLogs();

  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [keyFilter, setKeyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueModels = useMemo(
    () => [...new Set(requestLogs.map((l) => l.model))].sort(),
    [requestLogs]
  );
  const uniqueKeys = useMemo(
    () => [...new Set(requestLogs.map((l) => l.key_name))].sort(),
    [requestLogs]
  );

  const filtered = useMemo(() => {
    return requestLogs.filter((log) => {
      if (modelFilter !== "all" && log.model !== modelFilter) return false;
      if (keyFilter !== "all" && log.key_name !== keyFilter) return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.model.toLowerCase().includes(q) ||
          log.key_name.toLowerCase().includes(q) ||
          log.request_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requestLogs, modelFilter, keyFilter, statusFilter, search]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Logs</h1>
        <p className="text-muted-foreground text-sm">
          API-anrop
          {requestLogs.length > 0 && (
            <span className="ml-1.5 text-xs">({filtered.length}/{requestLogs.length})</span>
          )}
        </p>
      </div>

      {!logsLoading && requestLogs.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök modell, nyckel, request ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 h-9 text-sm"
            />
          </div>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue placeholder="Modell" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla modeller</SelectItem>
              {uniqueModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={keyFilter} onValueChange={setKeyFilter}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Nyckel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla nycklar</SelectItem>
              {uniqueKeys.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {logsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">
          {requestLogs.length === 0 ? "Inga API-anrop hittades" : "Inga resultat matchar filtren"}
        </p>
      ) : (
        <RequestLogTable logs={filtered} />
      )}
    </div>
  );
};
