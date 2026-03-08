import { supabase } from "@/integrations/supabase/client";
import { CreditTransaction } from "@/models/types/transaction.types";

export const transactionRepository = {
  async fetchTransactions(): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []) as CreditTransaction[];
  },
};
