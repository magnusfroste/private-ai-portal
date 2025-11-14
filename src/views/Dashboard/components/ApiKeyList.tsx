import { RefreshCw, Key, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiKey, KeyUsageInfo, SpendLog } from "@/models/types/apiKey.types";
import { ApiKeyCard } from "./ApiKeyCard";
import { KeyCreationDialog } from "./KeyCreationDialog";

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  keyUsageData: Record<string, KeyUsageInfo>;
  loadingUsage: Record<string, boolean>;
  spendLogs: Record<string, SpendLog[]>;
  onRefreshAll: () => void;
  onRefreshKey: (keyId: string) => void;
  onCopy: (text: string) => void;
  onCreateKey: (name: string, models: string[]) => Promise<boolean>;
  isCreatingKey: boolean;
  canCreateMore: boolean;
  remainingKeys: number;
}

export const ApiKeyList = ({
  apiKeys,
  keyUsageData,
  loadingUsage,
  spendLogs,
  onRefreshAll,
  onRefreshKey,
  onCopy,
  onCreateKey,
  isCreatingKey,
  canCreateMore,
  remainingKeys,
}: ApiKeyListProps) => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Key className="w-6 h-6" />
                API Keys
              </CardTitle>
              <CardDescription className="mt-2">
                Manage your API keys for accessing the LiteLLM proxy
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onRefreshAll}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <KeyCreationDialog 
                onCreateKey={onCreateKey} 
                isCreating={isCreatingKey}
                canCreateMore={canCreateMore}
                remainingKeys={remainingKeys}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No API keys yet</p>
              <KeyCreationDialog 
                onCreateKey={onCreateKey} 
                isCreating={isCreatingKey}
                canCreateMore={canCreateMore}
                remainingKeys={remainingKeys}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <ApiKeyCard
                  key={key.id}
                  apiKey={key}
                  usage={keyUsageData[key.id]}
                  spendLogs={spendLogs[key.id]}
                  isLoadingUsage={loadingUsage[key.id] || false}
                  onCopy={onCopy}
                  onRefreshUsage={onRefreshKey}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
