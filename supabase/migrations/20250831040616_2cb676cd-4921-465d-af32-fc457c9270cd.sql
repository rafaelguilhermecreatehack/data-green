-- COMPREHENSIVE SECURITY FIX: Clean slate approach

-- 1. Drop ALL existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can manage people in their ONG projects" ON public.pessoas;
DROP POLICY IF EXISTS "Users can view people from their ONG projects" ON public.pessoas;
DROP POLICY IF EXISTS "Secure pessoas view policy" ON public.pessoas;
DROP POLICY IF EXISTS "Secure pessoas insert policy" ON public.pessoas;
DROP POLICY IF EXISTS "Secure pessoas update policy" ON public.pessoas;
DROP POLICY IF EXISTS "Secure pessoas delete policy" ON public.pessoas;

DROP POLICY IF EXISTS "Admin can manage investors" ON public.investidores;
DROP POLICY IF EXISTS "Authenticated users can view investors" ON public.investidores;
DROP POLICY IF EXISTS "Masters and collaborators can create investors" ON public.investidores;
DROP POLICY IF EXISTS "Secure investidores view policy" ON public.investidores;
DROP POLICY IF EXISTS "Secure investidores insert policy" ON public.investidores;
DROP POLICY IF EXISTS "Secure investidores update policy" ON public.investidores;

DROP POLICY IF EXISTS "Masters can view users from their ONG" ON public.usuarios;
DROP POLICY IF EXISTS "Masters can view users from their ONG only" ON public.usuarios;

-- 2. Create new secure RLS policies with proper access control

-- PESSOAS table - Strict project-based access only
CREATE POLICY "pessoas_secure_select_2024"
ON public.pessoas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projetos p 
    WHERE p.id = pessoas.id_projeto_vinculado 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

CREATE POLICY "pessoas_secure_insert_2024"
ON public.pessoas 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.projetos p 
    WHERE p.id = pessoas.id_projeto_vinculado 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

CREATE POLICY "pessoas_secure_update_2024"
ON public.pessoas 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projetos p 
    WHERE p.id = pessoas.id_projeto_vinculado 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

CREATE POLICY "pessoas_secure_delete_2024"
ON public.pessoas 
FOR DELETE 
USING (
  public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role])
  AND EXISTS (
    SELECT 1 
    FROM public.projetos p 
    WHERE p.id = pessoas.id_projeto_vinculado 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

-- INVESTIDORES table - Project-linked access only
CREATE POLICY "investidores_secure_select_2024"
ON public.investidores 
FOR SELECT 
USING (
  public.get_user_role() = 'admin_global'::user_role
  OR EXISTS (
    SELECT 1 
    FROM public.aportes a
    JOIN public.projetos p ON a.id_projeto = p.id
    WHERE a.id_investidor = investidores.id 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

CREATE POLICY "investidores_secure_insert_2024"
ON public.investidores 
FOR INSERT 
WITH CHECK (
  public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role, 'colaborador_ong'::user_role])
);

CREATE POLICY "investidores_secure_update_2024"
ON public.investidores 
FOR UPDATE 
USING (
  public.get_user_role() = 'admin_global'::user_role
  OR EXISTS (
    SELECT 1 
    FROM public.aportes a
    JOIN public.projetos p ON a.id_projeto = p.id
    WHERE a.id_investidor = investidores.id 
    AND public.can_access_ong(p.id_ong_responsavel)
  )
);

-- USUARIOS table - Strict email privacy and tiered access
CREATE POLICY "usuarios_secure_select_2024"
ON public.usuarios 
FOR SELECT 
USING (
  -- Users can see their own profile
  user_id = auth.uid()
  -- Admin global can see all
  OR public.get_user_role() = 'admin_global'::user_role
  -- Master ONG can only see users from their ONG
  OR (
    public.get_user_role() = 'master_ong'::user_role 
    AND id_ong_vinculada = public.get_user_ong()
  )
);

-- 3. Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_log_access(
  table_name TEXT,
  record_id UUID,
  operation TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RAISE LOG 'SECURITY_AUDIT: User % performed % on %.% record % at %', 
    auth.uid(), operation, 'public', table_name, record_id, now();
END;
$$;

-- 4. Create financial data access control function
CREATE OR REPLACE FUNCTION public.can_access_financial_data()
RETURNS BOOLEAN
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role]);
$$;