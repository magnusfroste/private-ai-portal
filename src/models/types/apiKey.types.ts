export interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  created_at: string;
  expires_at: string | null;
  trial_credits_usd: number;
  used_credits_usd: number;
  is_active: boolean;
}

export interface KeyUsageInfo {
  key_name: string;
  key_alias: string;
  spend: number;
  max_budget: number;
  budget_remaining: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  models: string[];
  expires: string;
  metadata: any;
}

export interface SpendLog {
  request_id: string;
  startTime: string;
  model: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  spend: number;
  status: string;
}

export interface ApiKeyWithUsage extends ApiKey {
  usage?: KeyUsageInfo;
  spendLogs?: SpendLog[];
}

export interface CreateApiKeyDto {
  keyName: string;
  models?: string[];
  teamId?: string;
}
