import { useNavigate } from "react-router-dom";
import { authService } from "@/models/services/authService";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();

  const checkAuth = async () => {
    const isAuthenticated = await authService.checkAuth();
    if (!isAuthenticated) {
      navigate("/auth");
    }
    return isAuthenticated;
  };

  const signOut = async () => {
    await authService.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return { checkAuth, signOut };
};
