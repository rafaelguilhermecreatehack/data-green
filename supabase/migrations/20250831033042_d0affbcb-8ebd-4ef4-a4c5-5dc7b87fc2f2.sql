-- ===========================================
-- ONG HARMONY - COMPLETE BACKEND IMPLEMENTATION
-- ===========================================

-- 1. ENUMS AND TYPES
-- ===========================================

CREATE TYPE public.user_role AS ENUM ('admin_global', 'master_ong', 'colaborador_ong');
CREATE TYPE public.ong_category AS ENUM ('educacao', 'saude', 'meio_ambiente', 'assistencia_social', 'cultura', 'direitos_humanos');
CREATE TYPE public.project_status AS ENUM ('planejamento', 'em_andamento', 'concluido', 'suspenso');
CREATE TYPE public.investor_type AS ENUM ('pessoa_fisica', 'pessoa_juridica', 'governo', 'organismo_internacional');
CREATE TYPE public.income_range AS ENUM ('ate_1_salario', '1_2_salarios', '2_3_salarios', '3_5_salarios', 'acima_5_salarios');
CREATE TYPE public.education_level AS ENUM ('sem_escolaridade', 'fundamental_incompleto', 'fundamental_completo', 'medio_incompleto', 'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao');

-- 2. MAIN TABLES
-- ===========================================

-- Users (Profiles) Table
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    papel user_role NOT NULL DEFAULT 'colaborador_ong',
    id_ong_vinculada UUID,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ONGs Table
CREATE TABLE public.ongs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    categoria ong_category NOT NULL,
    contato TEXT NOT NULL,
    receita_anual DECIMAL(15,2),
    endereco_sede JSONB,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communities Table
CREATE TABLE public.comunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    bairro TEXT NOT NULL,
    idh DECIMAL(4,3) DEFAULT 0.000,
    total_beneficiarios INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects Table
CREATE TABLE public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_projeto TEXT NOT NULL,
    id_ong_responsavel UUID NOT NULL REFERENCES public.ongs(id) ON DELETE CASCADE,
    id_comunidade UUID NOT NULL REFERENCES public.comunidades(id) ON DELETE CASCADE,
    escopo TEXT,
    categoria ong_category,
    data_inicio DATE,
    data_fim_prevista DATE,
    status project_status DEFAULT 'planejamento',
    orcamento_total DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- People (Beneficiaries) Table
CREATE TABLE public.pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    genero TEXT,
    id_projeto_vinculado UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    id_comunidade UUID NOT NULL REFERENCES public.comunidades(id) ON DELETE CASCADE,
    faixa_renda_familiar income_range,
    nivel_escolaridade education_level,
    anos_estudo INTEGER DEFAULT 0,
    indicadores_saude JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Investors Table
CREATE TABLE public.investidores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_investidor TEXT NOT NULL,
    tipo_investidor investor_type NOT NULL,
    contato TEXT,
    documento TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contributions Table
CREATE TABLE public.aportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_investidor UUID NOT NULL REFERENCES public.investidores(id) ON DELETE CASCADE,
    id_projeto UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    valor_aporte DECIMAL(15,2) NOT NULL,
    data_aporte DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FOREIGN KEY CONSTRAINTS
-- ===========================================

ALTER TABLE public.usuarios ADD CONSTRAINT fk_usuarios_ong 
    FOREIGN KEY (id_ong_vinculada) REFERENCES public.ongs(id) ON DELETE SET NULL;

-- 4. INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_usuarios_papel ON public.usuarios(papel);
CREATE INDEX idx_usuarios_ong ON public.usuarios(id_ong_vinculada);
CREATE INDEX idx_projetos_ong ON public.projetos(id_ong_responsavel);
CREATE INDEX idx_projetos_comunidade ON public.projetos(id_comunidade);
CREATE INDEX idx_pessoas_projeto ON public.pessoas(id_projeto_vinculado);
CREATE INDEX idx_pessoas_comunidade ON public.pessoas(id_comunidade);
CREATE INDEX idx_aportes_projeto ON public.aportes(id_projeto);
CREATE INDEX idx_aportes_investidor ON public.aportes(id_investidor);

-- 5. SECURITY FUNCTIONS
-- ===========================================

-- Function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT papel FROM public.usuarios WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to get user's ONG (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_ong()
RETURNS UUID AS $$
    SELECT id_ong_vinculada FROM public.usuarios WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if user can access ONG data
CREATE OR REPLACE FUNCTION public.can_access_ong(ong_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin global can access everything
    IF public.get_user_role() = 'admin_global' THEN
        RETURN true;
    END IF;
    
    -- Users can only access their own ONG
    RETURN public.get_user_ong() = ong_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. IDH CALCULATION FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION public.calculate_community_idh(community_id UUID)
RETURNS DECIMAL(4,3) AS $$
DECLARE
    longevidade DECIMAL(4,3) := 0;
    educacao DECIMAL(4,3) := 0;
    renda DECIMAL(4,3) := 0;
    resultado_idh DECIMAL(4,3);
    total_pessoas INTEGER;
BEGIN
    -- Count total people in community
    SELECT COUNT(*) INTO total_pessoas 
    FROM public.pessoas 
    WHERE id_comunidade = community_id;
    
    IF total_pessoas = 0 THEN
        RETURN 0.000;
    END IF;
    
    -- LONGEVITY: Based on average age and health indicators
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
    
    -- EDUCATION: Based on schooling years and education level
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
    
    -- INCOME: Based on family income range
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

-- 7. UPDATE TRIGGERS
-- ===========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update community IDH when people are added/updated
CREATE OR REPLACE FUNCTION public.update_community_idh()
RETURNS TRIGGER AS $$
BEGIN
    -- Update IDH for the affected community
    IF TG_OP = 'DELETE' THEN
        UPDATE public.comunidades 
        SET 
            idh = public.calculate_community_idh(OLD.id_comunidade),
            total_beneficiarios = (SELECT COUNT(*) FROM public.pessoas WHERE id_comunidade = OLD.id_comunidade),
            updated_at = now()
        WHERE id = OLD.id_comunidade;
        RETURN OLD;
    ELSE
        UPDATE public.comunidades 
        SET 
            idh = public.calculate_community_idh(NEW.id_comunidade),
            total_beneficiarios = (SELECT COUNT(*) FROM public.pessoas WHERE id_comunidade = NEW.id_comunidade),
            updated_at = now()
        WHERE id = NEW.id_comunidade;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ongs_updated_at BEFORE UPDATE ON public.ongs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comunidades_updated_at BEFORE UPDATE ON public.comunidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON public.pessoas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investidores_updated_at BEFORE UPDATE ON public.investidores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aportes_updated_at BEFORE UPDATE ON public.aportes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- IDH calculation trigger
CREATE TRIGGER trigger_update_community_idh 
    AFTER INSERT OR UPDATE OR DELETE ON public.pessoas 
    FOR EACH ROW EXECUTE FUNCTION public.update_community_idh();

-- 8. ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ongs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aportes ENABLE ROW LEVEL SECURITY;

-- USUARIOS policies
CREATE POLICY "Users can view their own profile" ON public.usuarios FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.usuarios FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin can view all users" ON public.usuarios FOR SELECT USING (public.get_user_role() = 'admin_global');
CREATE POLICY "Admin can insert users" ON public.usuarios FOR INSERT WITH CHECK (public.get_user_role() = 'admin_global');
CREATE POLICY "Masters can view users from their ONG" ON public.usuarios FOR SELECT USING (
    public.get_user_role() = 'master_ong' AND id_ong_vinculada = public.get_user_ong()
);

-- ONGS policies
CREATE POLICY "Admin can manage all ONGs" ON public.ongs FOR ALL USING (public.get_user_role() = 'admin_global');
CREATE POLICY "Masters and collaborators can view their ONG" ON public.ongs FOR SELECT USING (
    public.can_access_ong(id)
);
CREATE POLICY "Masters can update their ONG" ON public.ongs FOR UPDATE USING (
    public.get_user_role() = 'master_ong' AND public.can_access_ong(id)
);

-- COMUNIDADES policies
CREATE POLICY "Authenticated users can view communities" ON public.comunidades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage communities" ON public.comunidades FOR ALL USING (public.get_user_role() = 'admin_global');
CREATE POLICY "Masters can create communities" ON public.comunidades FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin_global', 'master_ong')
);

-- PROJETOS policies
CREATE POLICY "Users can view projects from their ONG" ON public.projetos FOR SELECT USING (
    public.can_access_ong(id_ong_responsavel)
);
CREATE POLICY "Masters can manage projects from their ONG" ON public.projetos FOR ALL USING (
    public.can_access_ong(id_ong_responsavel) AND public.get_user_role() IN ('admin_global', 'master_ong')
);
CREATE POLICY "Collaborators can create and update projects" ON public.projetos FOR INSERT WITH CHECK (
    public.can_access_ong(id_ong_responsavel)
);
CREATE POLICY "Collaborators can update projects" ON public.projetos FOR UPDATE USING (
    public.can_access_ong(id_ong_responsavel)
);

-- PESSOAS policies
CREATE POLICY "Users can view people from their ONG projects" ON public.pessoas FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto_vinculado 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);
CREATE POLICY "Users can manage people in their ONG projects" ON public.pessoas FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto_vinculado 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

-- INVESTIDORES policies
CREATE POLICY "Authenticated users can view investors" ON public.investidores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage investors" ON public.investidores FOR ALL USING (public.get_user_role() = 'admin_global');
CREATE POLICY "Masters and collaborators can create investors" ON public.investidores FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin_global', 'master_ong', 'colaborador_ong')
);

-- APORTES policies
CREATE POLICY "Users can view contributions to their ONG projects" ON public.aportes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);
CREATE POLICY "Users can manage contributions to their ONG projects" ON public.aportes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projetos p 
        WHERE p.id = id_projeto 
        AND public.can_access_ong(p.id_ong_responsavel)
    )
);

-- 9. MOCKED DATA
-- ===========================================

-- Insert ONGs
INSERT INTO public.ongs (id, nome_fantasia, cnpj, categoria, contato, receita_anual, endereco_sede) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ONG Bem-Estar', '12.345.678/0001-90', 'educacao', 'contato@bemestar.org', 150000.00, '{"rua": "Rua das Flores, 123", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}'),
('550e8400-e29b-41d4-a716-446655440002', 'ONG Vida Digna', '98.765.432/0001-10', 'saude', 'contato@vidadigna.org', 200000.00, '{"rua": "Av. Saúde, 456", "cidade": "Rio de Janeiro", "estado": "RJ", "cep": "20000-000"}');

-- Insert Communities
INSERT INTO public.comunidades (id, cidade, estado, bairro) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'São Paulo', 'SP', 'Capão Redondo'),
('660e8400-e29b-41d4-a716-446655440002', 'Rio de Janeiro', 'RJ', 'Complexo do Alemão');

-- Insert Projects
INSERT INTO public.projetos (id, nome_projeto, id_ong_responsavel, id_comunidade, escopo, categoria, data_inicio, data_fim_prevista, status, orcamento_total) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Curso de Alfabetização Digital', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Capacitação em tecnologia para jovens e adultos', 'educacao', '2024-01-15', '2024-12-15', 'em_andamento', 50000.00),
('770e8400-e29b-41d4-a716-446655440002', 'Programa Saúde da Mulher', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Assistência médica e prevenção para mulheres', 'saude', '2024-02-01', '2024-11-30', 'em_andamento', 35000.00);

-- Insert People (will trigger IDH calculation)
INSERT INTO public.pessoas (nome_completo, data_nascimento, genero, id_projeto_vinculado, id_comunidade, faixa_renda_familiar, nivel_escolaridade, anos_estudo, indicadores_saude) VALUES
('Maria da Silva', '1989-03-15', 'feminino', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '1_2_salarios', 'medio_completo', 12, '{"imc": 22.5, "pressao_arterial": "normal", "diabetes": false}'),
('José Pereira', '1982-07-22', 'masculino', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'ate_1_salario', 'fundamental_incompleto', 6, '{"imc": 28.1, "pressao_arterial": "alta", "diabetes": false, "hipertensao": true}');

-- Insert Investors
INSERT INTO public.investidores (id, nome_investidor, tipo_investidor, contato, documento) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Empresa XYZ Ltda', 'pessoa_juridica', 'contato@empresaxyz.com', '11.222.333/0001-44'),
('880e8400-e29b-41d4-a716-446655440002', 'Maria Investimentos MEI', 'pessoa_juridica', 'maria@investimentos.com', '22.333.444/0001-55');

-- Insert Contributions
INSERT INTO public.aportes (id_investidor, id_projeto, valor_aporte, data_aporte, descricao) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 25000.00, '2024-01-10', 'Investimento inicial para equipamentos e capacitação'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 10000.00, '2024-01-25', 'Apoio para consultas médicas e exames preventivos');