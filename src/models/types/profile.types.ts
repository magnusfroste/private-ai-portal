export interface Profile {
  full_name: string | null;
  email: string;
  trial_keys_created: number;
  max_trial_keys: number;
}

export interface TrialKeyStatus {
  current: number;
  max: number;
  remaining: number;
  canCreate: boolean;
  message?: string;
}
