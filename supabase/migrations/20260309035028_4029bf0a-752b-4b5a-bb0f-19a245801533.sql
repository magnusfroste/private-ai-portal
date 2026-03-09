
CREATE TABLE public.curated_models (
  id text PRIMARY KEY,
  provider text NOT NULL DEFAULT '',
  max_input_tokens bigint,
  max_output_tokens bigint,
  input_cost_per_million numeric,
  output_cost_per_million numeric,
  mode text,
  status text NOT NULL DEFAULT 'unknown',
  enabled boolean NOT NULL DEFAULT false,
  huggingface_url text,
  last_synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.curated_models ENABLE ROW LEVEL SECURITY;

-- Anyone can read curated models (public listing)
CREATE POLICY "Anyone can read curated models"
  ON public.curated_models FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage curated models"
  ON public.curated_models FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
