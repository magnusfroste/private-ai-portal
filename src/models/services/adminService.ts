import { adminRepository } from "@/data/repositories/adminRepository";
import { AdminUser, UpdateUserPayload } from "@/models/types/admin.types";

export class AdminService {
  async getUsers(): Promise<AdminUser[]> {
    return adminRepository.fetchUsers();
  }

  async updateMaxTrialKeys(userId: string, maxKeys: number): Promise<AdminUser> {
    return adminRepository.updateUser({
      user_id: userId,
      max_trial_keys: maxKeys,
    });
  }

  async resetTrialKeys(userId: string): Promise<AdminUser> {
    return adminRepository.updateUser({
      user_id: userId,
      reset_trial_keys: true,
    });
  }

  async isAdmin(): Promise<boolean> {
    return adminRepository.checkIsAdmin();
  }
}

export const adminService = new AdminService();
