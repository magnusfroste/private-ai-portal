import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiKey } from "@/models/types/apiKey.types";

interface HistoricalKeyListProps {
  keys: ApiKey[];
  onCopy: (text: string) => void;
}

export const HistoricalKeyList = ({ keys, onCopy }: HistoricalKeyListProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/30 bg-card/30 opacity-75">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <Clock className="w-5 h-5" />
          Key History ({keys.length})
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="p-4 border border-border/30 rounded-lg bg-muted/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">{key.name}</span>
                  <StatusBadge apiKey={key} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => onCopy(key.key_value)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                {key.revoked_at && (
                  <span>Revoked: {new Date(key.revoked_at).toLocaleDateString()}</span>
                )}
                {key.expires_at && (
                  <span>Expired: {new Date(key.expires_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Status: {key.is_active ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

const StatusBadge = ({ apiKey }: { apiKey: ApiKey }) => {
  if (apiKey.revoked_at) {
    return <Badge variant="destructive" className="text-xs">Revoked</Badge>;
  }
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return <Badge variant="secondary" className="text-xs">Expired</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
};
