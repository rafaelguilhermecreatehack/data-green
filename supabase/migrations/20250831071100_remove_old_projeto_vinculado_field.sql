-- Migration: Remove old id_projeto_vinculado field from pessoas table
-- This completes the transition to the many-to-many relationship

-- 1. Drop dependent policies first
DROP POLICY IF EXISTS "pessoas_secure_select_2024" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_secure_insert_2024" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_secure_update_2024" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_secure_delete_2024" ON public.pessoas;

-- 2. Drop dependent policies on evolucao_pessoa table
DROP POLICY IF EXISTS "Users can view evolution of people from their ONG projects" ON public.evolucao_pessoa;
DROP POLICY IF EXISTS "Users can insert evolution for people from their ONG projects" ON public.evolucao_pessoa;
DROP POLICY IF EXISTS "Users can update evolution for people from their ONG projects" ON public.evolucao_pessoa;
DROP POLICY IF EXISTS "Users can delete evolution for people from their ONG projects" ON public.evolucao_pessoa;

-- 3. Remove the foreign key constraint
ALTER TABLE public.pessoas DROP CONSTRAINT IF EXISTS pessoas_id_projeto_vinculado_fkey;

-- 4. Remove the old column
ALTER TABLE public.pessoas DROP COLUMN IF EXISTS id_projeto_vinculado;

-- 5. Recreate the pessoas policies using the new relationship structure
CREATE POLICY "Users can view people from their ONG projects" ON public.pessoas FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = pessoas.id 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

CREATE POLICY "Users can manage people in their ONG projects" ON public.pessoas FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = pessoas.id 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

-- 6. Recreate evolucao_pessoa policies using the new relationship structure
CREATE POLICY "Users can view evolution of people from their ONG projects" ON public.evolucao_pessoa FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = evolucao_pessoa.id_pessoa 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

CREATE POLICY "Users can insert evolution for people from their ONG projects" ON public.evolucao_pessoa FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = evolucao_pessoa.id_pessoa 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

CREATE POLICY "Users can update evolution for people from their ONG projects" ON public.evolucao_pessoa FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = evolucao_pessoa.id_pessoa 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

CREATE POLICY "Users can delete evolution for people from their ONG projects" ON public.evolucao_pessoa FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.pessoa_projeto pp
        JOIN public.projetos p ON p.id = pp.id_projeto 
        WHERE pp.id_pessoa = evolucao_pessoa.id_pessoa 
        AND pp.ativo = true
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);
