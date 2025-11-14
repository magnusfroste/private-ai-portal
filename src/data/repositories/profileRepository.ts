import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/models/types/profile.types";

export class ProfileRepository {
  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, trial_keys_created, max_trial_keys")
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
}

export const profileRepository = new ProfileRepository();
