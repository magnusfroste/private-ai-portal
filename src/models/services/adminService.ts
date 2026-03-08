import { adminRepository } from "@/data/repositories/adminRepository";
import { AdminUser } from "@/models/types/admin.types";

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

  async updateLitellmBudget(userId: string, maxBudget: number): Promise<void> {
    await adminRepository.updateUser({
      user_id: userId,
      litellm_max_budget: maxBudget,
    });
  }

  async isAdmin(): Promise<boolean> {
    return adminRepository.checkIsAdmin();
  }
}

export const adminService = new AdminService();
