-- ===========================================
-- EVOLUÇÃO DE PROJETOS - HISTÓRICO DE EVOLUÇÃO
-- ===========================================

-- Create evolucao_projeto table
CREATE TABLE public.evolucao_projeto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_projeto UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    data_registro TIMESTAMPTZ DEFAULT now(),
    observacoes TEXT NOT NULL,
    status_anterior project_status,
    status_atual project_status,
    marco_alcancado TEXT,
    desafios_enfrentados TEXT,
    proximos_passos TEXT,
    id_usuario_registro UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_evolucao_projeto_id_projeto ON public.evolucao_projeto(id_projeto);
CREATE INDEX idx_evolucao_projeto_data_registro ON public.evolucao_projeto(data_registro DESC);
CREATE INDEX idx_evolucao_projeto_usuario ON public.evolucao_projeto(id_usuario_registro);

-- Add RLS policies
ALTER TABLE public.evolucao_projeto ENABLE ROW LEVEL SECURITY;

-- Policy for admin_global: full access
CREATE POLICY "Admin global can manage all project evolution records" ON public.evolucao_projeto
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE user_id = auth.uid() AND papel = 'admin_global'
        )
    );

-- Policy for master_ong and colaborador_ong: access only to their ONG's projects
CREATE POLICY "ONG users can manage their projects evolution records" ON public.evolucao_projeto
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.projetos p ON p.id = evolucao_projeto.id_projeto
            WHERE u.user_id = auth.uid() 
            AND u.id_ong_vinculada = p.id_ong_responsavel
            AND u.papel IN ('master_ong', 'colaborador_ong')
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER trigger_evolucao_projeto_updated_at
    BEFORE UPDATE ON public.evolucao_projeto
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.evolucao_projeto IS 'Histórico de evolução e acompanhamento de projetos';
COMMENT ON COLUMN public.evolucao_projeto.observacoes IS 'Campo livre para observações sobre a evolução do projeto';
COMMENT ON COLUMN public.evolucao_projeto.marco_alcancado IS 'Marco ou objetivo alcançado no projeto';
COMMENT ON COLUMN public.evolucao_projeto.desafios_enfrentados IS 'Desafios e dificuldades encontradas';
COMMENT ON COLUMN public.evolucao_projeto.proximos_passos IS 'Próximos passos planejados para o projeto';
