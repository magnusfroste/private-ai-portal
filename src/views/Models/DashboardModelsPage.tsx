import { Cpu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCuratedModels } from "@/hooks/useCuratedModels";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ModelRow } from "./components/ModelRow";
import { ConnectSection } from "./components/ConnectSection";
import { AgenticToolsSection } from "./components/AgenticToolsSection";

export const DashboardModelsPage = () => {
  const { models, isLoading } = useCuratedModels(true);
  const { settings, isLoading: settingsLoading } = useSiteSettings();

  const defaultModel = models.find((m) => m.is_default)?.id || models[0]?.id || "gpt-4o";
  const baseUrl = settings?.api_base_url || "https://api.autoversio.ai";

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      {/* Models list */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Models & Integration</h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Available models, API connection details, and guides for agentic coding tools.
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

      {/* API connect */}
      <ConnectSection defaultModel={defaultModel} baseUrl={baseUrl} />

      {/* Agentic coding tools */}
      <AgenticToolsSection baseUrl={baseUrl} />
    </div>
  );
};
