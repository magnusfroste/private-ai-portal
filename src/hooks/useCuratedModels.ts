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
    onError: () => toast.error("Failed to update model"),
  });

  const hfUrlMutation = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string | null }) =>
      curatedModelService.setHuggingfaceUrl(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => toast.error("Failed to save HuggingFace link"),
  });

  const syncMutation = useMutation({
    mutationFn: () => curatedModelService.syncModels(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${count} models synced from LiteLLM`);
    },
    onError: () => toast.error("Failed to sync models"),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => curatedModelService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Default model updated");
    },
    onError: () => toast.error("Failed to set default model"),
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
    setDefault: setDefaultMutation.mutate,
  };
};
