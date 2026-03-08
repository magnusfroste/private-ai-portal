import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpendLog } from "@/models/types/apiKey.types";

interface SpendLogTableProps {
  logs: SpendLog[];
  keyNames?: Record<string, string>;
}

export const SpendLogTable = ({ logs, keyNames }: SpendLogTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            {keyNames && <TableHead>Key</TableHead>}
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.slice(0, 50).map((log) => (
            <TableRow key={log.request_id}>
              <TableCell className="text-xs">
                {new Date(log.startTime).toLocaleString()}
              </TableCell>
              {keyNames && (
                <TableCell className="text-xs font-medium">
                  {keyNames[log.request_id] || "—"}
                </TableCell>
              )}
              <TableCell className="text-xs font-mono">{log.model}</TableCell>
              <TableCell className="text-right text-xs">
                {log.total_tokens.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-xs">
                ${log.spend.toFixed(6)}
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    log.status === "success"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {log.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
