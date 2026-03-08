import { supabase } from "@/integrations/supabase/client";
import { apiKeyRepository } from "@/data/repositories/apiKeyRepository";
import { ApiKey, CreateApiKeyDto } from "@/models/types/apiKey.types";

export class ApiKeyService {
  async getKeysForCurrentUser(): Promise<ApiKey[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    return apiKeyRepository.findByUserId(user.id);
  }

  async createKey(dto: CreateApiKeyDto): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { error } = await supabase.functions.invoke('generate-api-key', {
      body: {
        keyName: dto.keyName,
        models: dto.models,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
  }

  calculateRemainingDays(expiresAt: string | null): number | null {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export const apiKeyService = new ApiKeyService();
