
-- Tighten admin_settings read policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.admin_settings;

CREATE POLICY "Anon can read site settings"
ON public.admin_settings FOR SELECT
TO anon
USING (key = 'site_settings');

CREATE POLICY "Authenticated can read public settings"
ON public.admin_settings FOR SELECT
TO authenticated
USING (key IN ('site_settings', 'chat_enabled_models', 'chat_default_model'));

-- Allow users to delete their own API keys
CREATE POLICY "Users can delete own API keys"
ON public.api_keys FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Revoke EXECUTE on SECURITY DEFINER functions from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_single_default_model() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
-- has_role is used in RLS policies; it still works because policies bypass EXECUTE grants when
-- referenced from policy expressions evaluated as the table owner. Authenticated can keep EXECUTE
-- for direct calls used in client checks if needed; keep minimal.

-- Restrict storage listing on public site-assets bucket
DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;

CREATE POLICY "Authenticated can list site assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'site-assets');
-- Public file URLs (/object/public/site-assets/...) continue to work without RLS.
