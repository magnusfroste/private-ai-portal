import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { curatedModelService } from "@/models/services/curatedModelService";
import { toast } from "sonner";

const QUERY_KEY = "curated-models";

export const useCuratedModels = (enabledOnly = false) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, enabledOnly ? "enabled" : "all"],
    queryFn: () =>
      enabledOnly
        ? curatedModelService.getEnabledModels()
        : curatedModelService.getAllModels(),
    staleTime: 2 * 60 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      curatedModelService.toggleModel(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => toast.error("Kunde inte uppdatera modell"),
  });

  const hfUrlMutation = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string | null }) =>
      curatedModelService.setHuggingfaceUrl(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => toast.error("Kunde inte spara HuggingFace-länk"),
  });

  const syncMutation = useMutation({
    mutationFn: () => curatedModelService.syncModels(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${count} modeller synkade från LiteLLM`);
    },
    onError: () => toast.error("Kunde inte synka modeller"),
  });

  return {
    models: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    toggleModel: toggleMutation.mutate,
    setHuggingfaceUrl: hfUrlMutation.mutate,
    syncModels: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
};
