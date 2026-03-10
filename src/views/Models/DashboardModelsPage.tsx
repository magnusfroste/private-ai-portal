import { Skeleton } from "@/components/ui/skeleton";
import { useCuratedModels } from "@/hooks/useCuratedModels";
import { ModelRow } from "./components/ModelRow";

export const DashboardModelsPage = () => {
  const { models, isLoading } = useCuratedModels(true);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Models</h1>
        <p className="text-muted-foreground text-sm">
          Available models on the platform. See the <a href="/dashboard/api" className="text-primary hover:underline">API page</a> for integration guides.
        </p>
      </div>

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
