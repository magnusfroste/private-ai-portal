export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  company: string | null;
  trial_keys_created: number;
  max_trial_keys: number;
  api_key_count: number;
  litellm_user_id: string | null;
  litellm_budget: {
    max_budget: number;
    spend: number;
  } | null;
  created_at: string;
}

export interface UpdateUserPayload {
  user_id: string;
  max_trial_keys?: number;
  reset_trial_keys?: boolean;
  litellm_max_budget?: number;
}
