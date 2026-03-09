import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RequestLog } from "../hooks/useRequestLogs";

interface RequestLogTableProps {
  logs: RequestLog[];
}

export const RequestLogTable = ({ logs }: RequestLogTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tid</TableHead>
          <TableHead>Modell</TableHead>
          <TableHead>API-nyckel</TableHead>
          <TableHead className="text-right">Tokens</TableHead>
          <TableHead className="text-right">Kostnad</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.request_id}>
            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
              {log.startTime ? new Date(log.startTime).toLocaleString("sv-SE") : "—"}
            </TableCell>
            <TableCell className="font-mono text-xs">{log.model}</TableCell>
            <TableCell className="text-sm">{log.key_name}</TableCell>
            <TableCell className="text-right text-xs tabular-nums">
              {log.total_tokens.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-xs tabular-nums">
              ${log.spend.toFixed(6)}
            </TableCell>
            <TableCell>
              <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                {log.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
