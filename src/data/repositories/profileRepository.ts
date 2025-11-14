import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/models/types/profile.types";

export class ProfileRepository {
  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const profileRepository = new ProfileRepository();
