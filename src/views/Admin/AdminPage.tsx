import { useState } from "react";
import { Shield, Users } from "lucide-react";
import { AdminUser } from "@/models/types/admin.types";
import { useAdminData } from "./hooks/useAdminData";
import { UserTable } from "./components/UserTable";
import { EditUserDialog } from "./components/EditUserDialog";
import { AdminSettingsPanel } from "./components/AdminSettingsPanel";
import { ModelCurationPanel } from "./components/ModelCurationPanel";
import { StripeConfigCard } from "./components/StripeConfigCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AdminPage = () => {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    isError,
    isAdmin,
    isAdminLoading,
    updateBudget,
    isUpdating,
  } = useAdminData();

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (user: AdminUser) => {
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleUpdateBudget = (userId: string, maxBudget: number) => {
    updateBudget({ userId, maxBudget });
  };

  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Shield className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin permissions.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage users and trial keys</p>
        </div>
      </div>

      <AdminSettingsPanel />

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
      )}

      {isError && (
        <div className="text-center py-12 text-destructive">Failed to load users.</div>
      )}

      {!isLoading && !isError && (
        <UserTable users={users} onEdit={handleEdit} isUpdating={isUpdating} />
      )}

      <EditUserDialog
        user={editUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdateBudget={handleUpdateBudget}
        isUpdating={isUpdating}
      />
    </div>
  );
};
