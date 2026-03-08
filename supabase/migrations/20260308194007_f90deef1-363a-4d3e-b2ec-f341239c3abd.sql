CREATE TABLE public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read settings" ON public.admin_settings
  FOR SELECT TO authenticated
  USING (true);

-- Insert defaults
INSERT INTO public.admin_settings (key, value) VALUES
  ('default_user_budget_usd', '25'::jsonb),
  ('default_key_duration_days', '5'::jsonb),
  ('default_max_trial_keys', '3'::jsonb);