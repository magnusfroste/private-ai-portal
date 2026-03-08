import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/models/types/profile.types";

export class ProfileRepository {
  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, company, trial_keys_created, max_trial_keys")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async canCreateTrialKey(userId: string): Promise<boolean> {
    const profile = await this.findById(userId);
    if (!profile) return false;
    return profile.trial_keys_created < profile.max_trial_keys;
  }

  async update(userId: string, updates: { full_name?: string; company?: string }): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;
  }
}

export const profileRepository = new ProfileRepository();
