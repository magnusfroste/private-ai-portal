import { useProfile } from "@/hooks/useProfile";
import { ProfileSection } from "./components/ProfileSection";
import { Shield } from "lucide-react";

export const AccountPage = () => {
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal details</p>
      </div>

      <ProfileSection profile={profile} onUpdated={refetchProfile} />
    </div>
  );
};
