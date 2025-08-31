-- Fix security warnings by setting search_path for all functions

-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT papel FROM public.usuarios WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_ong()
RETURNS UUID AS $$
    SELECT id_ong_vinculada FROM public.usuarios WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SET search_path = public;