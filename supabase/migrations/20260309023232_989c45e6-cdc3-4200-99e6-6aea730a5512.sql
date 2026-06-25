-- One-off backfill from original instance. Only inserts if the auth user exists,
-- so this migration is a safe no-op on fresh installations.
INSERT INTO public.profiles (id, email, full_name)
SELECT 'f0c3e384-5bd3-4ef8-b612-503c080c15cb', 'privai4ever@gmail.com', 'privai'
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = 'f0c3e384-5bd3-4ef8-b612-503c080c15cb'
)
ON CONFLICT (id) DO NOTHING;
