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

