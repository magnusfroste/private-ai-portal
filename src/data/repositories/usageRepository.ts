import { supabase } from "@/integrations/supabase/client";
import { KeyUsageInfo, SpendLog } from "@/models/types/apiKey.types";

export class UsageRepository {
  async fetchKeyUsage(keyId: string): Promise<{ info: KeyUsageInfo; spend_logs: SpendLog[] } | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase.functions.invoke('get-key-usage', {
      body: { keyId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }
}

export const usageRepository = new UsageRepository();
