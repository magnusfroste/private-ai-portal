import { CreditCard, Zap, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Profile } from "@/models/types/profile.types";

interface SubscriptionSectionProps {
  profile: Profile | null;
}

export const SubscriptionSection = ({ profile }: SubscriptionSectionProps) => {
  if (!profile) return null;

  const keysUsedPercent = (profile.trial_keys_created / profile.max_trial_keys) * 100;
  const isAtLimit = profile.trial_keys_created >= profile.max_trial_keys;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <Badge variant="secondary" className="text-xs">Free Trial</Badge>
        </div>
        <CardDescription>Your subscription and credit usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trial Keys */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="w-4 h-4 text-primary" />
            Trial Keys
          </div>
          <Progress value={keysUsedPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {profile.trial_keys_created} / {profile.max_trial_keys} keys used
          </p>
          {isAtLimit && (
            <p className="text-xs text-destructive font-medium">
              Key limit reached — upgrade for more
            </p>
          )}
        </div>

        {/* Credits overview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-primary" />
            Credits
          </div>
          <p className="text-xs text-muted-foreground">
            Each trial key includes $0.25 in credits. Upgrade to add more credits to your account.
          </p>
        </div>

        {/* Upgrade CTA */}
        <Button className="w-full glow" disabled>
          <CreditCard className="w-4 h-4 mr-2" />
          Upgrade Plan (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
};
