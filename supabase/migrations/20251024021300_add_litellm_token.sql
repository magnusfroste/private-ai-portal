-- Add litellm_token field to api_keys table for better tracking
-- This stores the token identifier returned by LiteLLM API which makes it easier
-- to fetch logs and usage data without exposing the full API key

ALTER TABLE public.api_keys 
ADD COLUMN litellm_token TEXT;

-- Add index for faster lookups by token
CREATE INDEX idx_api_keys_litellm_token ON public.api_keys(litellm_token);

-- Add comment for documentation
COMMENT ON COLUMN public.api_keys.litellm_token IS 'Token identifier from LiteLLM API for tracking and log retrieval';
