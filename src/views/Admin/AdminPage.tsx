import { useState, useEffect } from "react";
import { Shield, Users } from "lucide-react";
import { AdminUser } from "@/models/types/admin.types";
import { useAdminData } from "./hooks/useAdminData";
import { UserTable } from "./components/UserTable";
import { EditUserDialog } from "./components/EditUserDialog";
import { AdminSettingsPanel } from "./components/AdminSettingsPanel";
import { ModelCurationPanel } from "./components/ModelCurationPanel";
import { StripeConfigCard } from "./components/StripeConfigCard";
import { CreditOverviewPanel } from "./components/CreditOverviewPanel";
import { ApiKeyOverviewPanel } from "./components/ApiKeyOverviewPanel";
import { UsageStatsPanel } from "./components/UsageStatsPanel";
import { SiteSettingsPage } from "@/views/SiteSettings/SiteSettingsPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground text-sm">Hantera användare, modeller, krediter och inställningar</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Användare</TabsTrigger>
          <TabsTrigger value="credits">Krediter</TabsTrigger>
          <TabsTrigger value="keys">API-nycklar</TabsTrigger>
          <TabsTrigger value="usage">Användning</TabsTrigger>
          <TabsTrigger value="models">Modeller</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-6">
          <AdminSettingsPanel />
          <StripeConfigCard />
          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">Loading users...</div>
          )}
          {isError && (
            <div className="text-center py-12 text-destructive">Failed to load users.</div>
          )}
          {!isLoading && !isError && (
            <UserTable users={users} onEdit={handleEdit} isUpdating={isUpdating} />
          )}
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <CreditOverviewPanel />
        </TabsContent>

        <TabsContent value="keys" className="mt-6">
          <ApiKeyOverviewPanel />
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <UsageStatsPanel />
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <ModelCurationPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SiteSettingsPage embedded />
        </TabsContent>
      </Tabs>

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
