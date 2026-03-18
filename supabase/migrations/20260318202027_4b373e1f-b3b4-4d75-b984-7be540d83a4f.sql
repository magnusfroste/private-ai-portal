
DROP POLICY "Anyone can read settings" ON public.admin_settings;
CREATE POLICY "Anyone can read settings" ON public.admin_settings
  FOR SELECT TO anon, authenticated
  USING (true);
