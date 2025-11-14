-- Add trial key tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN trial_keys_created integer DEFAULT 0 NOT NULL,
ADD COLUMN max_trial_keys integer DEFAULT 3 NOT NULL;

-- Add constraint to ensure trial_keys_created doesn't exceed max
ALTER TABLE public.profiles 
ADD CONSTRAINT trial_keys_check 
CHECK (trial_keys_created >= 0 AND trial_keys_created <= max_trial_keys);

-- Create atomic increment function for thread-safe counter updates
CREATE OR REPLACE FUNCTION public.increment_trial_key_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET trial_keys_created = trial_keys_created + 1
  WHERE id = user_id_param 
    AND trial_keys_created < max_trial_keys;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot increment: limit reached or user not found';
  END IF;
END;
$$;