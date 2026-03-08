import { supabase } from "@/integrations/supabase/client";
import { UserBudget } from "@/models/types/userBudget.types";

export class UserBudgetRepository {
  async fetchBudget(): Promise<UserBudget> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase.functions.invoke('get-user-budget', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data as UserBudget;
  }
}

export const userBudgetRepository = new UserBudgetRepository();
