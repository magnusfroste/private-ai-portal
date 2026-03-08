-- Index for api_keys: user_id + created_at (used in findByUserId with order by)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id_created_at 
  ON public.api_keys (user_id, created_at DESC);

-- Index for api_keys: active status filter
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id_active 
  ON public.api_keys (user_id, is_active) WHERE is_active = true;

-- Index for token_usage: user_id + timestamp (logs queries)
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id_timestamp 
  ON public.token_usage (user_id, timestamp DESC);

-- Index for token_usage: api_key_id + timestamp (per-key usage)
CREATE INDEX IF NOT EXISTS idx_token_usage_api_key_id_timestamp 
  ON public.token_usage (api_key_id, timestamp DESC);

-- Index for token_usage: model lookups for activity grouping
CREATE INDEX IF NOT EXISTS idx_token_usage_model 
  ON public.token_usage (model);

-- Index for credit_transactions: user_id + created_at
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id_created_at 
  ON public.credit_transactions (user_id, created_at DESC);
