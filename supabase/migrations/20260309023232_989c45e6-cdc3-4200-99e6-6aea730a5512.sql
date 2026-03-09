INSERT INTO public.profiles (id, email, full_name)
VALUES (
  'f0c3e384-5bd3-4ef8-b612-503c080c15cb',
  'privai4ever@gmail.com',
  'privai'
)
ON CONFLICT (id) DO NOTHING;