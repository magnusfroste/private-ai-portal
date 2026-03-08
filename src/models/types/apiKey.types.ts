export interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
}

export interface CreateApiKeyDto {
  keyName: string;
  models?: string[];
}

export class TrialLimitExceededError extends Error {
  constructor(current: number, max: number) {
    super(`Trial key limit reached (${current}/${max}). Upgrade to create more keys.`);
    this.name = 'TrialLimitExceededError';
  }
}
