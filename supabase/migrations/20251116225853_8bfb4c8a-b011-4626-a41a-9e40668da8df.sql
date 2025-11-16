-- Add missing litellm_token column to api_keys table
ALTER TABLE public.api_keys 
ADD COLUMN litellm_token text;