import { profileRepository } from "@/data/repositories/profileRepository";
import { authService } from "./authService";
import { Profile, ProfileUpdateData, TrialKeyStatus } from "@/models/types/profile.types";

export class ProfileService {
  async getCurrentUserProfile(): Promise<Profile | null> {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    return profileRepository.findById(user.id);
  }

  async updateProfile(updates: ProfileUpdateData): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    return profileRepository.update(user.id, updates);
  }

  async getTrialKeyStatus(userId: string): Promise<TrialKeyStatus> {
    const profile = await profileRepository.findById(userId);
    if (!profile) throw new Error("Profile not found");

    const remaining = profile.max_trial_keys - profile.trial_keys_created;
    const canCreate = remaining > 0;

    return {
      current: profile.trial_keys_created,
      max: profile.max_trial_keys,
      remaining,
      canCreate,
      message: canCreate 
        ? `${remaining} trial key${remaining !== 1 ? 's' : ''} remaining`
        : 'Trial key limit reached. Upgrade to create more keys.'
    };
  }
}

export const profileService = new ProfileService();
