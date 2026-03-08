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

  const updateBudgetMutation = useMutation({
    mutationFn: ({ userId, maxBudget }: { userId: string; maxBudget: number }) =>
      adminService.updateLitellmBudget(userId, maxBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Budget uppdaterat");
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
    updateBudget: updateBudgetMutation.mutate,
    isUpdating: updateBudgetMutation.isPending,
  };
};
