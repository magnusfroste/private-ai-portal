export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  company: string | null;
  trial_keys_created: number;
  max_trial_keys: number;
  api_key_count: number;
  created_at: string;
}

export interface UpdateUserPayload {
  user_id: string;
  max_trial_keys?: number;
  reset_trial_keys?: boolean;
}
