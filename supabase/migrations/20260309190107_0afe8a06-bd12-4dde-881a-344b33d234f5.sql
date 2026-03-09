
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS model_name text;
UPDATE public.curated_models SET model_name = id WHERE model_name IS NULL;
TRUNCATE public.curated_models;
