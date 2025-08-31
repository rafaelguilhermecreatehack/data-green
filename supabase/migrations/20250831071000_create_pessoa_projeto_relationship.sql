-- Migration: Create many-to-many relationship between pessoas and projetos
-- This replaces the current 1:1 relationship with a flexible N:N relationship

-- 1. Create the junction table for pessoa-projeto relationship
CREATE TABLE public.pessoa_projeto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pessoa UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    id_projeto UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    data_vinculacao DATE NOT NULL DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure unique combination of person and project
    UNIQUE(id_pessoa, id_projeto)
);

-- 2. Create indexes for performance
CREATE INDEX idx_pessoa_projeto_pessoa ON public.pessoa_projeto(id_pessoa);
CREATE INDEX idx_pessoa_projeto_projeto ON public.pessoa_projeto(id_projeto);
CREATE INDEX idx_pessoa_projeto_ativo ON public.pessoa_projeto(ativo);

-- 3. Add trigger for updated_at
CREATE TRIGGER update_pessoa_projeto_updated_at 
    BEFORE UPDATE ON public.pessoa_projeto 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Enable RLS on the new table
ALTER TABLE public.pessoa_projeto ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for pessoa_projeto table
CREATE POLICY "Users can view pessoa_projeto from their ONG projects" ON public.pessoa_projeto FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

CREATE POLICY "Users can manage pessoa_projeto in their ONG projects" ON public.pessoa_projeto FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

-- 6. Migrate existing data from pessoas.id_projeto_vinculado to pessoa_projeto table
INSERT INTO public.pessoa_projeto (id_pessoa, id_projeto, data_vinculacao, ativo)
SELECT 
    id,
    id_projeto_vinculado,
    COALESCE(created_at::date, CURRENT_DATE),
    true
FROM public.pessoas 
WHERE id_projeto_vinculado IS NOT NULL;

-- 7. Update the IDH calculation function to work with the new relationship
CREATE OR REPLACE FUNCTION public.calculate_community_idh(community_id UUID)
RETURNS DECIMAL(4,3) AS $$
DECLARE
    longevidade DECIMAL(4,3) := 0;
    educacao DECIMAL(4,3) := 0;
    renda DECIMAL(4,3) := 0;
    resultado_idh DECIMAL(4,3);
    total_pessoas INTEGER;
BEGIN
    -- Count total people in community (unchanged)
    SELECT COUNT(*) INTO total_pessoas 
    FROM public.pessoas 
    WHERE id_comunidade = community_id;
    
    IF total_pessoas = 0 THEN
        RETURN 0.000;
    END IF;
    
    -- LONGEVITY: Based on average age and health indicators (unchanged)
    WITH longevidade_calc AS (
        SELECT 
            AVG(EXTRACT(YEAR FROM age(data_nascimento))) as idade_media,
            AVG(CASE 
                WHEN (indicadores_saude->>'imc')::DECIMAL BETWEEN 18.5 AND 25 THEN 1.0
                WHEN (indicadores_saude->>'imc')::DECIMAL BETWEEN 25 AND 30 THEN 0.8
                ELSE 0.6
            END) as indice_saude
        FROM public.pessoas 
        WHERE id_comunidade = community_id
    )
    SELECT (LEAST(idade_media/80.0, 1.0) * 0.7 + indice_saude * 0.3) INTO longevidade
    FROM longevidade_calc;
    
    -- EDUCATION: Based on schooling years and education level (unchanged)
    WITH educacao_calc AS (
        SELECT 
            AVG(CASE nivel_escolaridade
                WHEN 'sem_escolaridade' THEN 0
                WHEN 'fundamental_incompleto' THEN 4
                WHEN 'fundamental_completo' THEN 8
                WHEN 'medio_incompleto' THEN 10
                WHEN 'medio_completo' THEN 12
                WHEN 'superior_incompleto' THEN 14
                WHEN 'superior_completo' THEN 16
                WHEN 'pos_graduacao' THEN 18
                ELSE 0
            END) as anos_estudo_medio
        FROM public.pessoas 
        WHERE id_comunidade = community_id
    )
    SELECT LEAST(anos_estudo_medio/18.0, 1.0) INTO educacao
    FROM educacao_calc;
    
    -- INCOME: Based on family income range (unchanged)
    WITH renda_calc AS (
        SELECT 
            AVG(CASE faixa_renda_familiar
                WHEN 'ate_1_salario' THEN 0.2
                WHEN '1_2_salarios' THEN 0.4
                WHEN '2_3_salarios' THEN 0.6
                WHEN '3_5_salarios' THEN 0.8
                WHEN 'acima_5_salarios' THEN 1.0
                ELSE 0.1
            END) as indice_renda
        FROM public.pessoas 
        WHERE id_comunidade = community_id
    )
    SELECT indice_renda INTO renda
    FROM renda_calc;
    
    -- Calculate IDH using geometric mean
    resultado_idh := POWER(longevidade * educacao * renda, 1.0/3.0);
    
    RETURN ROUND(resultado_idh, 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create helper function to get projects for a person
CREATE OR REPLACE FUNCTION public.get_person_projects(person_id UUID)
RETURNS TABLE(
    projeto_id UUID,
    nome_projeto TEXT,
    data_vinculacao DATE,
    ativo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id_projeto,
        p.nome_projeto,
        pp.data_vinculacao,
        pp.ativo
    FROM public.pessoa_projeto pp
    JOIN public.projetos p ON p.id = pp.id_projeto
    WHERE pp.id_pessoa = person_id
    AND pp.ativo = true
    ORDER BY pp.data_vinculacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Create helper function to get people for a project
CREATE OR REPLACE FUNCTION public.get_project_people(project_id UUID)
RETURNS TABLE(
    pessoa_id UUID,
    nome_completo TEXT,
    data_vinculacao DATE,
    ativo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id_pessoa,
        p.nome_completo,
        pp.data_vinculacao,
        pp.ativo
    FROM public.pessoa_projeto pp
    JOIN public.pessoas p ON p.id = pp.id_pessoa
    WHERE pp.id_projeto = project_id
    AND pp.ativo = true
    ORDER BY pp.data_vinculacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
