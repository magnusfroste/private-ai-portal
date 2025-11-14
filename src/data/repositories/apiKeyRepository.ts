import { supabase } from "@/integrations/supabase/client";
import { ApiKey } from "@/models/types/apiKey.types";

export class ApiKeyRepository {
  async findByUserId(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(keyId: string): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", keyId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const apiKeyRepository = new ApiKeyRepository();
