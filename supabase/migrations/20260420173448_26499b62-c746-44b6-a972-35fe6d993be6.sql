
-- Migrate enabled/is_default from old rows (id = model_name, model_name IS NULL)
-- to new rows (UUID id, model_name set)
UPDATE public.curated_models AS new_row
SET 
  enabled = old_row.enabled OR new_row.enabled,
  is_default = old_row.is_default OR new_row.is_default,
  huggingface_url = COALESCE(new_row.huggingface_url, old_row.huggingface_url),
  updated_at = now()
FROM public.curated_models AS old_row
WHERE old_row.model_name IS NULL
  AND new_row.model_name IS NOT NULL
  AND new_row.model_name = old_row.id
  AND new_row.id <> old_row.id;

-- Delete the old duplicate rows
DELETE FROM public.curated_models
WHERE model_name IS NULL;
