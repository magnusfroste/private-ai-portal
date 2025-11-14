import { supabase } from "@/integrations/supabase/client";
import { apiKeyRepository } from "@/data/repositories/apiKeyRepository";
import { usageRepository } from "@/data/repositories/usageRepository";
import { profileRepository } from "@/data/repositories/profileRepository";
import { ApiKey, ApiKeyWithUsage, CreateApiKeyDto, KeyUsageInfo, TrialLimitExceededError } from "@/models/types/apiKey.types";

export class ApiKeyService {
  async getKeysForCurrentUser(): Promise<ApiKey[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    return apiKeyRepository.findByUserId(user.id);
  }

  async getKeyWithUsage(keyId: string): Promise<ApiKeyWithUsage | null> {
    const key = await apiKeyRepository.findById(keyId);
    if (!key) return null;

    try {
      const usageData = await usageRepository.fetchKeyUsage(keyId);
      return {
        ...key,
        usage: usageData?.info,
        spendLogs: usageData?.spend_logs,
      };
    } catch (error) {
      console.error("Error fetching usage:", error);
      return key;
    }
  }

  async createKey(dto: CreateApiKeyDto): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check trial limit BEFORE calling edge function
    const profile = await profileRepository.findById(user.id);
    if (!profile) throw new Error("Profile not found");

    if (profile.trial_keys_created >= profile.max_trial_keys) {
      throw new TrialLimitExceededError(
        profile.trial_keys_created, 
        profile.max_trial_keys
      );
    }

    const { error } = await supabase.functions.invoke('generate-api-key', {
      body: {
        keyName: dto.keyName,
        models: dto.models,
        teamId: dto.teamId || 'e2e76f95-0fbf-4077-bf9c-0d16880f99b0',
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
  }

  calculateTotalCredits(keys: ApiKey[], usageData: Record<string, KeyUsageInfo>): number {
    return keys.reduce((sum, key) => {
      const usage = usageData[key.id];
      return sum + (usage ? Number(usage.max_budget) : Number(key.trial_credits_usd));
    }, 0);
  }

  calculateUsedCredits(keys: ApiKey[], usageData: Record<string, KeyUsageInfo>): number {
    return keys.reduce((sum, key) => {
      const usage = usageData[key.id];
      return sum + (usage ? Number(usage.spend) : Number(key.used_credits_usd));
    }, 0);
  }

  calculateRemainingCredits(keys: ApiKey[], usageData: Record<string, KeyUsageInfo>): number {
    return keys.reduce((sum, key) => {
      const usage = usageData[key.id];
      return sum + (usage ? Number(usage.budget_remaining) : (Number(key.trial_credits_usd) - Number(key.used_credits_usd)));
    }, 0);
  }

  calculateBudgetUsagePercent(key: ApiKey, usage?: KeyUsageInfo): number {
    if (usage) {
      return (Number(usage.spend) / Number(usage.max_budget)) * 100;
    }
    return (Number(key.used_credits_usd) / Number(key.trial_credits_usd)) * 100;
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
