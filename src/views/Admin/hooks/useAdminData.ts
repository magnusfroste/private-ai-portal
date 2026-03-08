import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/models/services/adminService";
import { toast } from "sonner";

export const useAdminData = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
  });

  const isAdminQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => adminService.isAdmin(),
  });

  const updateMaxKeysMutation = useMutation({
    mutationFn: ({ userId, maxKeys }: { userId: string; maxKeys: number }) =>
      adminService.updateMaxTrialKeys(userId, maxKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Max trial keys uppdaterat");
    },
    onError: (error: Error) => {
      toast.error(`Kunde inte uppdatera: ${error.message}`);
    },
  });

  const resetKeysMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetTrialKeys(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Trial keys nollställda");
    },
    onError: (error: Error) => {
      toast.error(`Kunde inte nollställa: ${error.message}`);
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ userId, maxBudget }: { userId: string; maxBudget: number }) =>
      adminService.updateLitellmBudget(userId, maxBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("LiteLLM budget uppdaterat");
    },
    onError: (error: Error) => {
      toast.error(`Kunde inte uppdatera budget: ${error.message}`);
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    isAdmin: isAdminQuery.data ?? false,
    isAdminLoading: isAdminQuery.isLoading,
    updateMaxKeys: updateMaxKeysMutation.mutate,
    resetKeys: resetKeysMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    isUpdating: updateMaxKeysMutation.isPending || resetKeysMutation.isPending || updateBudgetMutation.isPending,
  };
};
