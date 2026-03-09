import { useQuery } from "@tanstack/react-query";
import { adminDataRepository, AdminKeyData } from "@/data/repositories/adminDataRepository";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const ApiKeyOverviewPanel = () => {
  const { data, isLoading } = useQuery<AdminKeyData>({
    queryKey: ["admin-keys"],
    queryFn: () => adminDataRepository.fetchKeys(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCount = data?.keys?.filter((k) => k.is_active).length || 0;
  const revokedCount = data?.keys?.filter((k) => k.revoked_at).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="rounded-lg border p-4 flex-1">
          <p className="text-sm text-muted-foreground">Aktiva nycklar</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border p-4 flex-1">
          <p className="text-sm text-muted-foreground">Revokerade</p>
          <p className="text-2xl font-bold text-destructive">{revokedCount}</p>
        </div>
        <div className="rounded-lg border p-4 flex-1">
          <p className="text-sm text-muted-foreground">Totalt</p>
          <p className="text-2xl font-bold">{data?.keys?.length || 0}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Ägare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Förbrukat</TableHead>
              <TableHead>Skapad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.keys?.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium">{k.name}</TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{k.profiles?.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{k.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {k.revoked_at ? (
                    <Badge variant="destructive">Revokerad</Badge>
                  ) : k.is_active ? (
                    <Badge variant="default">Aktiv</Badge>
                  ) : (
                    <Badge variant="secondary">Inaktiv</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  ${Number(k.used_credits_usd || 0).toFixed(4)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(k.created_at), "yyyy-MM-dd")}
                </TableCell>
              </TableRow>
            ))}
            {(!data?.keys || data.keys.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Inga API-nycklar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
