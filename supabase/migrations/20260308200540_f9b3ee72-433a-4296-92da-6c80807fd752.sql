
-- Drop the increment_trial_key_count function that references these columns
DROP FUNCTION IF EXISTS public.increment_trial_key_count(uuid);

-- Remove trial key columns from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS trial_keys_created;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS max_trial_keys;
