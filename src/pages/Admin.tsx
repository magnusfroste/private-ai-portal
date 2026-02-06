import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminPanel } from "@/views/Admin/AdminPanel";

const Admin = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return <AdminPanel />;
};

export default Admin;
