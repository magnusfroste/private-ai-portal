import { AdminUser } from "@/models/types/admin.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Key } from "lucide-react";
import { format } from "date-fns";

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  isUpdating: boolean;
}

export const UserTable = ({ users, onEdit, isUpdating }: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead>E-post</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Trial Keys</TableHead>
            <TableHead>API-nycklar</TableHead>
            <TableHead>Registrerad</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const limitReached = user.trial_keys_created >= user.max_trial_keys;
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "—"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.company || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {user.trial_keys_created}/{user.max_trial_keys}
                    </span>
                    {limitReached && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                        Max
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-muted-foreground" />
                    {user.api_key_count}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(user.created_at), "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={isUpdating}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Inga användare hittades
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
