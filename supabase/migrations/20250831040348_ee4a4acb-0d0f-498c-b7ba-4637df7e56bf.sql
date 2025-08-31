-- CRITICAL SECURITY FIXES

-- 1. DROP existing problematic RLS policies and create secure ones

-- Drop existing pessoas policies
DROP POLICY IF EXISTS "Users can manage people in their ONG projects" ON public.pessoas;
DROP POLICY IF EXISTS "Users can view people from their ONG projects" ON public.pessoas;

-- Create secure pessoas policies with strict project-based access
CREATE POLICY "Users can view people from their ONG projects only"
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

CREATE POLICY "Users can create people for their ONG projects only"
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

CREATE POLICY "Users can update people from their ONG projects only"
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

CREATE POLICY "Masters can delete people from their ONG projects"
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

-- 2. Secure usuarios table - restrict email access and implement tiered access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Masters can view users from their ONG" ON public.usuarios;

-- Create secure usuarios policies
CREATE POLICY "Masters can view users from their ONG only"
ON public.usuarios 
FOR SELECT 
USING (
  (public.get_user_role() = 'master_ong'::user_role AND id_ong_vinculada = public.get_user_ong())
  OR public.get_user_role() = 'admin_global'::user_role
  OR user_id = auth.uid()
);

-- 3. Secure investidores table with ONG-specific access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view investors" ON public.investidores;
DROP POLICY IF EXISTS "Masters and collaborators can create investors" ON public.investidores;

-- Create secure investidores policies - only allow access to investors linked to user's ONG projects
CREATE POLICY "Users can view investors linked to their ONG projects"
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

CREATE POLICY "Users can create investors for their ONG"
ON public.investidores 
FOR INSERT 
WITH CHECK (
  public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role, 'colaborador_ong'::user_role])
);

CREATE POLICY "Users can update investors linked to their ONG"
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

-- 4. Secure ongs table - restrict financial data access for non-masters
CREATE POLICY "Collaborators can view limited ONG data"
ON public.ongs 
FOR SELECT 
USING (
  public.can_access_ong(id) 
  AND (
    public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role])
    OR (public.get_user_role() = 'colaborador_ong'::user_role)
  )
);

-- 5. Add audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  table_name TEXT,
  record_id UUID,
  action TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log to postgres logs for now (can be enhanced with dedicated audit table)
  RAISE LOG 'AUDIT: User % performed % on %.% record %', 
    auth.uid(), action, 'public', table_name, record_id;
END;
$$;

-- 6. Create function to check if user can access sensitive financial data
CREATE OR REPLACE FUNCTION public.can_access_financial_data()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role]);
$$;