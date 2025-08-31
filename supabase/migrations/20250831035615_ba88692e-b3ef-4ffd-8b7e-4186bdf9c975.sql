-- Insert the master user into the usuarios table
INSERT INTO public.usuarios (
  user_id,
  nome,
  email,
  papel,
  ativo
) VALUES (
  'e626eec9-0c48-4f63-b93c-a1f8543fd75c',
  'Rafael Guilherme',
  'rafael.guilherme.createhack@gmail.com',
  'admin_global',
  true
);