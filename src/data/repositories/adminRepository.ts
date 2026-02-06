import { supabase } from "@/integrations/supabase/client";
import { AdminUser, UpdateUserPayload } from "@/models/types/admin.types";

export class AdminRepository {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
  }

  private get functionUrl(): string {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
  }

  async fetchUsers(): Promise<AdminUser[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(this.functionUrl, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }

    const data = await response.json();
    return data.users;
  }

  async updateUser(payload: UpdateUserPayload): Promise<AdminUser> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(this.functionUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update user");
    }

    const data = await response.json();
    return data.user;
  }

  async checkIsAdmin(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    return !!data;
  }
}

export const adminRepository = new AdminRepository();
