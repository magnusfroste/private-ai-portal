import { Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "./hooks/useDashboardData";

export const DashboardActivity = () => {
  const { loading: profileLoading } = useProfile();
  const { loading: keysLoading } = useDashboardData();

  if (profileLoading || keysLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Usage activity is now tracked at the account level. View your budget on the Keys page.
        </p>
      </div>
    </div>
  );
};
