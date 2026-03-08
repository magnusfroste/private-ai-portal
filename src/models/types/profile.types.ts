export interface Profile {
  full_name: string | null;
  email: string;
  company: string | null;
  trial_keys_created: number;
  max_trial_keys: number;
  purchased_credits_usd: number;
}

export interface ProfileUpdateData {
  full_name?: string;
  company?: string;
}

export interface TrialKeyStatus {
  current: number;
  max: number;
  remaining: number;
  canCreate: boolean;
  message?: string;
}
