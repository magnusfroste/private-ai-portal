import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiKey } from "@/models/types/apiKey.types";

interface KeyEventLogProps {
  keys: ApiKey[];
}

export const KeyEventLog = ({ keys }: KeyEventLogProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key Name</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium text-sm">{key.name}</TableCell>
              <TableCell>
                <StatusBadge apiKey={key} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {getEventDate(key)}
              </TableCell>
              <TableCell className="text-right text-xs">
                ${Number(key.trial_credits_usd).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-xs">
                ${Number(key.used_credits_usd).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const StatusBadge = ({ apiKey }: { apiKey: ApiKey }) => {
  if (apiKey.revoked_at) {
    return <Badge variant="destructive" className="text-xs">Revoked</Badge>;
  }
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return <Badge variant="secondary" className="text-xs">Expired</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
};

const getEventDate = (key: ApiKey): string => {
  const date = key.revoked_at || key.expires_at || key.created_at;
  return new Date(date).toLocaleString();
};
