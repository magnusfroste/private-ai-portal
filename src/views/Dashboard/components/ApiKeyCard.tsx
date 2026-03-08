import { useState } from "react";
import { Copy, Eye, EyeOff, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ApiKey, KeyUsageInfo } from "@/models/types/apiKey.types";
import { apiKeyService } from "@/models/services/apiKeyService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  usage?: KeyUsageInfo;
  onCopy: (text: string) => void;
  onRevoke?: (keyId: string) => void;
  isRevoking?: boolean;
}

export const ApiKeyCard = ({
  apiKey,
  usage,
  onCopy,
  onRevoke,
  isRevoking,
}: ApiKeyCardProps) => {
  const [showKey, setShowKey] = useState(false);

  const remainingDays = apiKeyService.calculateRemainingDays(apiKey.expires_at);
  const usagePercent = apiKeyService.calculateBudgetUsagePercent(apiKey, usage);

  return (
    <div className="p-6 border border-border/50 rounded-lg bg-card/50 hover:bg-card/80 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{apiKey.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={apiKey.is_active ? "default" : "secondary"}>
              {apiKey.is_active ? "Active" : "Inactive"}
            </Badge>
            {remainingDays !== null && (
              <Badge variant="outline">
                {remainingDays > 0 ? `${remainingDays} days left` : "Expired"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {onRevoke && apiKey.is_active && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={isRevoking}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently deactivate "{apiKey.name}" and remove it from LiteLLM. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRevoke(apiKey.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Revoke Key
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={showKey ? apiKey.key_value : "sk-" + "•".repeat(48)}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onCopy(apiKey.key_value)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Created: {new Date(apiKey.created_at).toLocaleDateString()}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Usage</span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            ${(Number(apiKey.trial_credits_usd) - Number(apiKey.used_credits_usd)).toFixed(4)} remaining
          </p>
        </div>
      </div>
    </div>
  );
};

const Input = ({ value, readOnly, className }: any) => (
  <input
    value={value}
    readOnly={readOnly}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);
