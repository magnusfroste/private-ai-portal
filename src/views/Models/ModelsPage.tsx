import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Hash, DollarSign, Cpu, Copy, Terminal, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCuratedModels } from "@/hooks/useCuratedModels";
import { CuratedModel } from "@/models/types/curatedModel.types";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatTokenCount = (tokens: number | null): string => {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
};

const formatCost = (cost: number | null): string => {
  if (cost === null || cost === undefined) return "—";
  if (cost === 0) return "$0";
  return `$${cost}`;
};

const StatusDot = ({ status }: { status: CuratedModel["status"] }) => {
  const colors: Record<string, string> = {
    healthy: "bg-emerald-500",
    unhealthy: "bg-destructive",
    unknown: "bg-blue-400",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]}`}
      title={status === "healthy" ? "Online" : status === "unhealthy" ? "Offline" : "Unknown"}
    />
  );
};

const ModelRow = ({ model }: { model: CuratedModel }) => (
  <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/60 p-4 transition-colors hover:bg-accent/20">
    <StatusDot status={model.status} />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-sm font-semibold text-foreground truncate">
          {model.id}
        </span>
        <Badge variant="outline" className="text-[10px]">{model.provider}</Badge>
        {model.mode && <Badge variant="secondary" className="text-[10px]">{model.mode}</Badge>}
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          {(model.max_input_tokens || model.max_output_tokens) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {formatTokenCount(model.max_input_tokens)} → {formatTokenCount(model.max_output_tokens)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Context: {formatTokenCount(model.max_input_tokens)} in → {formatTokenCount(model.max_output_tokens)} out
              </TooltipContent>
            </Tooltip>
          )}
          {(model.input_cost_per_million !== null || model.output_cost_per_million !== null) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCost(model.input_cost_per_million)} / {formatCost(model.output_cost_per_million)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Per 1M tokens: {formatCost(model.input_cost_per_million)} in / {formatCost(model.output_cost_per_million)} out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>

    {model.huggingface_url && (
      <a
        href={model.huggingface_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <span className="hidden sm:inline">HuggingFace</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    )}
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
};

const ConnectSection = ({ defaultModel }: { defaultModel: string }) => (
  <Card className="border-border/50 bg-card/60">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Terminal className="w-5 h-5 text-primary" />
        Connect to the API
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="openai">OpenAI SDK / curl</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
        </TabsList>

        <TabsContent value="openai" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Point any OpenAI-compatible client at the base URL below and use your API key.
            Pass the model ID from the list above as the <code className="text-primary font-mono text-xs">model</code> parameter.
          </p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-1 overflow-x-auto">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground"># Base URL</p>
                  <p>https://api.autoversio.ai/</p>
                </div>
                <CopyButton text="https://api.autoversio.ai/" />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-1 overflow-x-auto">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground"># Example curl request</p>
                  <p>curl https://api.autoversio.ai/v1/chat/completions \</p>
                  <p className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
                  <p className="ml-4">-H "Content-Type: application/json" \</p>
                  <p className="ml-4">-d '{"{"}"model": "{defaultModel}", "messages": [{"{"}"role": "user", "content": "Hello"{"}"}]{"}"}'</p>
                </div>
                <CopyButton text={`curl https://api.autoversio.ai/v1/chat/completions \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${defaultModel}", "messages": [{"role": "user", "content": "Hello"}]}'`} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="claude-code" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Claude Code works natively with the proxy. Set these environment variables and start coding.
          </p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>export ANTHROPIC_BASE_URL=https://api.autoversio.ai</span>
                <CopyButton text="export ANTHROPIC_BASE_URL=https://api.autoversio.ai" />
              </div>
              <div className="flex items-center justify-between">
                <span>export ANTHROPIC_API_KEY=&lt;your-api-key&gt;</span>
                <CopyButton text="export ANTHROPIC_API_KEY=" />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span>claude</span>
                <CopyButton text="claude" />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Replace <code className="text-primary">&lt;your-api-key&gt;</code> with an API key from your dashboard.
          </p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export const ModelsPage = () => {
  const { models, isLoading } = useCuratedModels(true);
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const siteName = settings?.site_name || "the portal";
  const isPublic = settings?.models_public ?? false;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (authChecked && !settingsLoading && !isPublic && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authChecked, settingsLoading, isPublic, isAuthenticated, navigate]);

  const defaultModel = models.find((m) => m.is_default)?.id || models[0]?.id || "gpt-4o";

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Models</h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          These are the models currently available through {siteName}.
          Use any model ID below via the API — click the HuggingFace link for full documentation.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : models.length === 0 ? (
          <p className="text-muted-foreground text-sm">No models available at the moment.</p>
        ) : (
          <div className="space-y-2">
            {models.map((m) => (
              <ModelRow key={m.id} model={m} />
            ))}
          </div>
        )}
      </div>

      <ConnectSection defaultModel={defaultModel} />
    </div>
  );
};
