import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async checkAuth(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }
}

export const authService = new AuthService();
