-- CRITICAL SECURITY FIXES - Step 1: Clean up and secure RLS policies

-- 1. Completely rebuild pessoas policies for strict security
DROP POLICY IF EXISTS "Users can view people from their ONG projects only" ON public.pessoas;
DROP POLICY IF EXISTS "Users can create people for their ONG projects only" ON public.pessoas;
DROP POLICY IF EXISTS "Users can update people from their ONG projects only" ON public.pessoas;
DROP POLICY IF EXISTS "Masters can delete people from their ONG projects" ON public.pessoas;

-- Secure pessoas policies with strict project-based access
CREATE POLICY "Secure pessoas view policy"
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

CREATE POLICY "Secure pessoas insert policy"
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

CREATE POLICY "Secure pessoas update policy"
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

CREATE POLICY "Secure pessoas delete policy"
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

-- 2. Secure investidores table policies
DROP POLICY IF EXISTS "Users can view investors linked to their ONG projects" ON public.investidores;
DROP POLICY IF EXISTS "Users can create investors for their ONG" ON public.investidores;
DROP POLICY IF EXISTS "Users can update investors linked to their ONG" ON public.investidores;

CREATE POLICY "Secure investidores view policy"
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

CREATE POLICY "Secure investidores insert policy"
ON public.investidores 
FOR INSERT 
WITH CHECK (
  public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role, 'colaborador_ong'::user_role])
);

CREATE POLICY "Secure investidores update policy"
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