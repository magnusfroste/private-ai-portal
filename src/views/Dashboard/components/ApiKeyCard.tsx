import { useState } from "react";
import { Copy, Eye, EyeOff, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiKey } from "@/models/types/apiKey.types";
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
  onCopy: (text: string) => void;
  onRevoke?: (keyId: string) => void;
  isRevoking?: boolean;
}

export const ApiKeyCard = ({
  apiKey,
  onCopy,
  onRevoke,
  isRevoking,
}: ApiKeyCardProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="p-6 border border-border/50 rounded-lg bg-card/50 hover:bg-card/80 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{apiKey.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={apiKey.is_active ? "default" : "secondary"}>
              {apiKey.is_active ? "Active" : "Inactive"}
            </Badge>
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

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={showKey ? apiKey.key_value : "sk-" + "•".repeat(48)}
            readOnly
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
      </div>
    </div>
  );
};
