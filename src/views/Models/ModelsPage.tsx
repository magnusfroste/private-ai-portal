import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Hash, DollarSign, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useCuratedModels } from "@/hooks/useCuratedModels";
import { CuratedModel } from "@/models/types/curatedModel.types";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";

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

export const ModelsPage = () => {
  const { models, isLoading } = useCuratedModels(true);
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const siteName = settings?.site_name || "the portal";
  const isPublic = settings?.models_public ?? false;

  useEffect(() => {
    if (!authLoading && !settingsLoading && !isPublic && !session) {
      navigate("/auth");
    }
  }, [authLoading, settingsLoading, isPublic, session, navigate]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Cpu className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Models</h1>
      </div>
      <p className="text-muted-foreground mb-8 max-w-xl">
        These are the models currently available through {siteName}.
        Use any model below via the API with your key — point your client at the base URL and pass the model ID.
        Click the HuggingFace link for full model documentation.
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
  );
};
