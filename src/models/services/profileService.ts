import { profileRepository } from "@/data/repositories/profileRepository";
import { authService } from "./authService";
import { Profile, ProfileUpdateData } from "@/models/types/profile.types";

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
}

export const profileService = new ProfileService();
