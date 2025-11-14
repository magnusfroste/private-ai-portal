import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/models/types/profile.types";

interface DashboardHeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
}

export const DashboardHeader = ({ profile, onSignOut }: DashboardHeaderProps) => {
  return (
    <>
      <nav className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Autoversio</span>
          </div>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {profile?.full_name || "Developer"}
        </h1>
        <p className="text-muted-foreground">{profile?.email}</p>
      </div>
    </>
  );
};
