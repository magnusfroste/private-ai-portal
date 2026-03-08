import { Shield, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Profile } from "@/models/types/profile.types";
import { adminRepository } from "@/data/repositories/adminRepository";

interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
}

export const DashboardHeader = ({ profile, onSignOut }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => adminRepository.checkIsAdmin(),
  });

  return (
    <>
      <nav className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Autoversio</span>
          </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/account")}>
              <User className="w-4 h-4 mr-2" />
              Account
            </Button>
            {isAdmin && (
              <Button variant="ghost" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="ghost" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || "Developer"}
            </h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};
