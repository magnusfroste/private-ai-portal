import { useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw, Activity, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiKey, KeyUsageInfo, SpendLog } from "@/models/types/apiKey.types";
import { apiKeyService } from "@/models/services/apiKeyService";
import { SpendLogTable } from "./SpendLogTable";
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
  spendLogs?: SpendLog[];
  isLoadingUsage: boolean;
  onCopy: (text: string) => void;
  onRefreshUsage: (keyId: string) => void;
  onRevoke?: (keyId: string) => void;
  isRevoking?: boolean;
}

export const ApiKeyCard = ({
  apiKey,
  usage,
  spendLogs,
  isLoadingUsage,
  onCopy,
  onRefreshUsage,
  onRevoke,
  isRevoking,
}: ApiKeyCardProps) => {
  const [showKey, setShowKey] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefreshUsage(apiKey.id)}
          disabled={isLoadingUsage}
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingUsage ? "animate-spin" : ""}`} />
        </Button>
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

        {isLoadingUsage ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : usage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Spend</p>
                <p className="text-lg font-semibold">${Number(usage.spend).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold">
                  ${Number(usage.budget_remaining).toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-lg font-semibold">
                  {Number(usage.total_tokens).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Models</p>
                <p className="text-lg font-semibold">{usage.models.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span>{usagePercent.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
            </div>

            {spendLogs && spendLogs.length > 0 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="w-full"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {expanded ? "Hide" : "Show"} Usage Log ({spendLogs.length} requests)
                </Button>
                {expanded && <SpendLogTable logs={spendLogs} />}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estimated Usage</span>
              <span>{usagePercent.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              ${(Number(apiKey.trial_credits_usd) - Number(apiKey.used_credits_usd)).toFixed(4)}{" "}
              remaining
            </p>
          </div>
        )}
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
