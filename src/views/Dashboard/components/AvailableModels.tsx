import { useEffect, useState } from "react";
import { Cpu, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { modelService } from "@/models/services/modelService";

export const AvailableModels = () => {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelService.getAvailableModels();
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models:", err);
      setError("Could not load available models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="container mx-auto px-4 pb-8">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Available Models
            </CardTitle>
            <CardDescription>
              Models accessible with your API key
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchModels}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground">No models available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <Badge key={model} variant="secondary" className="font-mono text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
