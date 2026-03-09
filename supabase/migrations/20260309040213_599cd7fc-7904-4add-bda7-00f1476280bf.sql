-- Add is_default column to curated_models (only one model can be default)
ALTER TABLE public.curated_models 
ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

-- Create a function to ensure only one default model
CREATE OR REPLACE FUNCTION public.ensure_single_default_model()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.curated_models 
    SET is_default = false 
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce single default
CREATE TRIGGER enforce_single_default_model
BEFORE INSERT OR UPDATE ON public.curated_models
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_model();