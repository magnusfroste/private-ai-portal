import { profileRepository } from "@/data/repositories/profileRepository";
import { authService } from "./authService";
import { Profile } from "@/models/types/profile.types";

export class ProfileService {
  async getCurrentUserProfile(): Promise<Profile | null> {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    return profileRepository.findById(user.id);
  }
}

export const profileService = new ProfileService();
