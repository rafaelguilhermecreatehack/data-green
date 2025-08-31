-- Insert master admin user in usuarios table
-- Note: The user must first be created manually in Supabase Auth with email: rafael.guilherme.createhack@gmail.com and password: GRUPO17
-- Then get the user_id from auth.users and replace the UUID below

-- For now, we'll create a placeholder that can be updated later with the actual auth user_id
INSERT INTO public.usuarios (
  user_id,
  nome,
  email,
  papel,
  ativo,
  id_ong_vinculada
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- This will need to be updated with actual auth.users id
  'Rafael Guilherme',
  'rafael.guilherme.createhack@gmail.com',
  'admin_global',
  true,
  NULL
);

-- Add a comment for manual steps
COMMENT ON TABLE public.usuarios IS 'MANUAL STEP REQUIRED: After creating user rafael.guilherme.createhack@gmail.com in Supabase Auth, update the user_id in usuarios table with the actual auth.users id';