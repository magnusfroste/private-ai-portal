import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUser } from "@/models/types/admin.types";
import { useAdminData } from "./hooks/useAdminData";
import { UserTable } from "./components/UserTable";
import { EditUserDialog } from "./components/EditUserDialog";
import { AdminSettingsPanel } from "./components/AdminSettingsPanel";

export const AdminPanel = () => {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    isError,
    isAdmin,
    isAdminLoading,
    updateMaxKeys,
    resetKeys,
    isUpdating,
  } = useAdminData();

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (user: AdminUser) => {
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleSave = (userId: string, maxKeys: number) => {
    updateMaxKeys({ userId, maxKeys });
  };

  const handleReset = (userId: string) => {
    resetKeys(userId);
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Åtkomst nekad</h1>
        <p className="text-muted-foreground">Du har inte admin-behörighet.</p>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Autoversio</span>
            <span className="text-sm text-muted-foreground ml-2">/ Admin</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Användarhantering</h1>
            <p className="text-muted-foreground">
              Hantera användare och trial-nycklar
            </p>
          </div>
        </div>

        <AdminSettingsPanel />

        <div className="mt-8">
          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Laddar användare...
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-destructive">
              Kunde inte ladda användare. Försök igen.
            </div>
          )}

          {!isLoading && !isError && (
            <UserTable
              users={users}
              onEdit={handleEdit}
              isUpdating={isUpdating}
            />
          )}
        </div>
      </div>

      <EditUserDialog
        user={editUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onReset={handleReset}
        isUpdating={isUpdating}
      />
    </div>
  );
};
