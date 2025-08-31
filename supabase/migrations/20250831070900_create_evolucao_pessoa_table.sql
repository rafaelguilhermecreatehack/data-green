-- ===========================================
-- EVOLUÇÃO DE PESSOAS - HISTÓRICO DE EVOLUÇÃO
-- ===========================================

-- Create evolucao_pessoa table
CREATE TABLE public.evolucao_pessoa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pessoa UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    data_registro TIMESTAMPTZ DEFAULT now(),
    observacoes TEXT NOT NULL,
    indicadores_anteriores JSONB DEFAULT '{}',
    indicadores_atuais JSONB DEFAULT '{}',
    progresso_educacional TEXT,
    progresso_saude TEXT,
    participacao_atividades TEXT,
    mudanca_renda income_range,
    mudanca_escolaridade education_level,
    peso_anterior DECIMAL(5,2),
    peso_atual DECIMAL(5,2),
    altura_anterior DECIMAL(4,2),
    altura_atual DECIMAL(4,2),
    id_usuario_registro UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_evolucao_pessoa_id_pessoa ON public.evolucao_pessoa(id_pessoa);
CREATE INDEX idx_evolucao_pessoa_data_registro ON public.evolucao_pessoa(data_registro DESC);
CREATE INDEX idx_evolucao_pessoa_usuario ON public.evolucao_pessoa(id_usuario_registro);

-- Add RLS policies
ALTER TABLE public.evolucao_pessoa ENABLE ROW LEVEL SECURITY;

-- Policy for admin_global: full access
CREATE POLICY "Admin global can manage all person evolution records" ON public.evolucao_pessoa
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE user_id = auth.uid() AND papel = 'admin_global'
        )
    );

-- Policy for master_ong and colaborador_ong: access only to their ONG's people
CREATE POLICY "ONG users can manage their people evolution records" ON public.evolucao_pessoa
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.pessoas p ON p.id = evolucao_pessoa.id_pessoa
            JOIN public.projetos pr ON pr.id = p.id_projeto_vinculado
            WHERE u.user_id = auth.uid() 
            AND u.id_ong_vinculada = pr.id_ong_responsavel
            AND u.papel IN ('master_ong', 'colaborador_ong')
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER trigger_evolucao_pessoa_updated_at
    BEFORE UPDATE ON public.evolucao_pessoa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update community IDH when person evolution is recorded
CREATE OR REPLACE FUNCTION trigger_update_idh_on_person_evolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update community IDH when person evolution indicates significant changes
    IF NEW.mudanca_escolaridade IS NOT NULL OR NEW.mudanca_renda IS NOT NULL OR 
       NEW.peso_atual IS NOT NULL OR NEW.altura_atual IS NOT NULL THEN
        
        -- Update the person's main record if there are changes
        UPDATE public.pessoas SET
            faixa_renda_familiar = COALESCE(NEW.mudanca_renda, faixa_renda_familiar),
            nivel_escolaridade = COALESCE(NEW.mudanca_escolaridade, nivel_escolaridade),
            indicadores_saude = CASE 
                WHEN NEW.peso_atual IS NOT NULL AND NEW.altura_atual IS NOT NULL THEN
                    jsonb_set(
                        jsonb_set(indicadores_saude, '{peso}', to_jsonb(NEW.peso_atual)),
                        '{altura}', to_jsonb(NEW.altura_atual)
                    )
                ELSE indicadores_saude
            END,
            updated_at = now()
        WHERE id = NEW.id_pessoa;
        
        -- Trigger community IDH recalculation
        PERFORM update_community_idh_for_person(NEW.id_pessoa);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for IDH update
CREATE TRIGGER trigger_person_evolution_update_idh
    AFTER INSERT OR UPDATE ON public.evolucao_pessoa
    FOR EACH ROW EXECUTE FUNCTION trigger_update_idh_on_person_evolution();

-- Add comments for documentation
COMMENT ON TABLE public.evolucao_pessoa IS 'Histórico de evolução e acompanhamento de pessoas/beneficiários';
COMMENT ON COLUMN public.evolucao_pessoa.observacoes IS 'Campo livre para observações sobre a evolução da pessoa';
COMMENT ON COLUMN public.evolucao_pessoa.indicadores_anteriores IS 'Indicadores de saúde e educação anteriores (JSON)';
COMMENT ON COLUMN public.evolucao_pessoa.indicadores_atuais IS 'Indicadores de saúde e educação atuais (JSON)';
COMMENT ON COLUMN public.evolucao_pessoa.progresso_educacional IS 'Notas sobre progresso educacional';
COMMENT ON COLUMN public.evolucao_pessoa.progresso_saude IS 'Notas sobre progresso de saúde';
COMMENT ON COLUMN public.evolucao_pessoa.participacao_atividades IS 'Participação em atividades do projeto';
