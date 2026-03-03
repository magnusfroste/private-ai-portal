import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminPanel } from "@/views/Admin/AdminPanel";
import { AdminErrorBoundary } from "@/views/Admin/components/AdminErrorBoundary";

const Admin = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminErrorBoundary>
      <AdminPanel />
    </AdminErrorBoundary>
  );
};

export default Admin;
