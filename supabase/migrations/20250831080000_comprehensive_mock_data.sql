-- ===========================================
-- COMPREHENSIVE MOCK DATA FOR ALL TABLES
-- ===========================================

-- Clear existing data (in correct order to avoid FK constraints)
DELETE FROM public.aportes;
DELETE FROM public.evolucao_pessoa;
DELETE FROM public.evolucao_projeto;
DELETE FROM public.pessoa_projeto;
DELETE FROM public.pessoas;
DELETE FROM public.investidores;
DELETE FROM public.projetos;
DELETE FROM public.comunidades;
DELETE FROM public.ongs;

-- Insert ONGs (5 organizations)
INSERT INTO public.ongs (id, nome_fantasia, cnpj, categoria, contato, receita_anual, endereco_sede) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ONG Bem-Estar Social', '12.345.678/0001-90', 'educacao', 'contato@bemestar.org', 250000.00, '{"rua": "Rua das Flores, 123", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Vida Digna Saúde', '98.765.432/0001-10', 'saude', 'contato@vidadigna.org', 180000.00, '{"rua": "Av. Saúde, 456", "cidade": "Rio de Janeiro", "estado": "RJ", "cep": "20000-000"}'),
('550e8400-e29b-41d4-a716-446655440003', 'Verde Esperança', '11.222.333/0001-44', 'meio_ambiente', 'contato@verdeesperanca.org', 320000.00, '{"rua": "Rua Ecológica, 789", "cidade": "Curitiba", "estado": "PR", "cep": "80000-000"}'),
('550e8400-e29b-41d4-a716-446655440004', 'Cultura Viva', '22.333.444/0001-55', 'cultura', 'contato@culturaviva.org', 150000.00, '{"rua": "Av. Cultural, 321", "cidade": "Salvador", "estado": "BA", "cep": "40000-000"}'),
('550e8400-e29b-41d4-a716-446655440005', 'Direitos Humanos Brasil', '33.444.555/0001-66', 'direitos_humanos', 'contato@dhbrasil.org', 280000.00, '{"rua": "Rua da Justiça, 654", "cidade": "Brasília", "estado": "DF", "cep": "70000-000"}');

-- Insert Communities (12 communities across Brazil)
INSERT INTO public.comunidades (id, cidade, estado, bairro) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'São Paulo', 'SP', 'Capão Redondo'),
('660e8400-e29b-41d4-a716-446655440002', 'Rio de Janeiro', 'RJ', 'Complexo do Alemão'),
('660e8400-e29b-41d4-a716-446655440003', 'Salvador', 'BA', 'Subúrbio Ferroviário'),
('660e8400-e29b-41d4-a716-446655440004', 'Recife', 'PE', 'Brasília Teimosa'),
('660e8400-e29b-41d4-a716-446655440005', 'Fortaleza', 'CE', 'Grande Bom Jardim'),
('660e8400-e29b-41d4-a716-446655440006', 'Curitiba', 'PR', 'Cidade Industrial'),
('660e8400-e29b-41d4-a716-446655440007', 'Porto Alegre', 'RS', 'Restinga'),
('660e8400-e29b-41d4-a716-446655440008', 'Manaus', 'AM', 'Cidade Nova'),
('660e8400-e29b-41d4-a716-446655440009', 'Belém', 'PA', 'Terra Firme'),
('660e8400-e29b-41d4-a716-446655440010', 'Goiânia', 'GO', 'Jardim Novo Mundo'),
('660e8400-e29b-41d4-a716-446655440011', 'Brasília', 'DF', 'Ceilândia'),
('660e8400-e29b-41d4-a716-446655440012', 'Belo Horizonte', 'MG', 'Aglomerado da Serra');

-- Insert Projects (15 projects)
INSERT INTO public.projetos (id, nome_projeto, id_ong_responsavel, id_comunidade, escopo, categoria, data_inicio, data_fim_prevista, status, orcamento_total) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Alfabetização Digital Jovem', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Capacitação em tecnologia para jovens de 15-25 anos', 'educacao', '2024-01-15', '2024-12-15', 'em_andamento', 85000.00),
('770e8400-e29b-41d4-a716-446655440002', 'Saúde da Mulher Integral', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Assistência médica e prevenção para mulheres', 'saude', '2024-02-01', '2024-11-30', 'em_andamento', 65000.00),
('770e8400-e29b-41d4-a716-446655440003', 'Horta Comunitária Sustentável', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', 'Criação de hortas urbanas sustentáveis', 'meio_ambiente', '2024-03-01', '2025-02-28', 'em_andamento', 45000.00),
('770e8400-e29b-41d4-a716-446655440004', 'Teatro na Comunidade', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'Oficinas de teatro para crianças e adolescentes', 'cultura', '2024-01-20', '2024-10-20', 'em_andamento', 35000.00),
('770e8400-e29b-41d4-a716-446655440005', 'Direitos da Criança', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440011', 'Proteção e educação sobre direitos infantis', 'direitos_humanos', '2024-02-15', '2024-12-15', 'em_andamento', 75000.00),
('770e8400-e29b-41d4-a716-446655440006', 'Educação Ambiental Escolar', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'Programa de conscientização ambiental nas escolas', 'meio_ambiente', '2024-01-10', '2024-11-10', 'em_andamento', 55000.00),
('770e8400-e29b-41d4-a716-446655440007', 'Capacitação Profissional Adultos', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Cursos profissionalizantes para adultos', 'educacao', '2024-03-01', '2025-01-31', 'planejamento', 95000.00),
('770e8400-e29b-41d4-a716-446655440008', 'Saúde Mental Comunitária', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'Apoio psicológico e grupos de apoio', 'saude', '2024-04-01', '2025-03-31', 'planejamento', 70000.00),
('770e8400-e29b-41d4-a716-446655440009', 'Música para Todos', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440008', 'Ensino de música para crianças carentes', 'cultura', '2023-09-01', '2024-08-31', 'concluido', 40000.00),
('770e8400-e29b-41d4-a716-446655440010', 'Reciclagem e Renda', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009', 'Cooperativa de reciclagem para geração de renda', 'meio_ambiente', '2023-06-01', '2024-05-31', 'concluido', 80000.00),
('770e8400-e29b-41d4-a716-446655440011', 'Combate à Violência Doméstica', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440010', 'Apoio a mulheres vítimas de violência', 'direitos_humanos', '2024-01-01', '2024-12-31', 'em_andamento', 90000.00),
('770e8400-e29b-41d4-a716-446655440012', 'Biblioteca Comunitária', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012', 'Criação e manutenção de biblioteca comunitária', 'educacao', '2024-02-01', '2025-01-31', 'em_andamento', 50000.00),
('770e8400-e29b-41d4-a716-446655440013', 'Prevenção de Doenças Tropicais', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008', 'Campanhas de prevenção na Amazônia', 'saude', '2024-03-15', '2024-12-15', 'em_andamento', 60000.00),
('770e8400-e29b-41d4-a716-446655440014', 'Arte Urbana Transformadora', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440007', 'Grafite e arte urbana para jovens', 'cultura', '2024-01-15', '2024-10-15', 'suspenso', 30000.00),
('770e8400-e29b-41d4-a716-446655440015', 'Inclusão Digital Idosos', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Tecnologia para terceira idade', 'educacao', '2024-05-01', '2025-04-30', 'planejamento', 40000.00);

-- Insert People (50 beneficiaries with diverse profiles)
INSERT INTO public.pessoas (id, nome_completo, data_nascimento, genero, id_comunidade, faixa_renda_familiar, nivel_escolaridade, anos_estudo, peso, altura, indicadores_saude) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Maria da Silva Santos', '1989-03-15', 'feminino', '660e8400-e29b-41d4-a716-446655440001', '1_2_salarios', 'medio_completo', 12, 65.5, 1.65, '{"imc": 24.1, "pressao_arterial": "normal", "diabetes": false, "colesterol": "normal"}'),
('880e8400-e29b-41d4-a716-446655440002', 'José Pereira Lima', '1982-07-22', 'masculino', '660e8400-e29b-41d4-a716-446655440002', 'ate_1_salario', 'fundamental_incompleto', 6, 78.2, 1.72, '{"imc": 26.4, "pressao_arterial": "alta", "diabetes": false, "hipertensao": true}'),
('880e8400-e29b-41d4-a716-446655440003', 'Ana Carolina Oliveira', '1995-11-08', 'feminino', '660e8400-e29b-41d4-a716-446655440003', '2_3_salarios', 'superior_incompleto', 14, 58.0, 1.60, '{"imc": 22.7, "pressao_arterial": "normal", "diabetes": false, "anemia": false}'),
('880e8400-e29b-41d4-a716-446655440004', 'Carlos Eduardo Souza', '1978-01-30', 'masculino', '660e8400-e29b-41d4-a716-446655440004', '1_2_salarios', 'medio_incompleto', 10, 85.3, 1.78, '{"imc": 26.9, "pressao_arterial": "normal", "diabetes": true, "medicacao_diabetes": true}'),
('880e8400-e29b-41d4-a716-446655440005', 'Fernanda Costa Alves', '1992-09-12', 'feminino', '660e8400-e29b-41d4-a716-446655440005', 'ate_1_salario', 'fundamental_completo', 8, 62.8, 1.58, '{"imc": 25.2, "pressao_arterial": "normal", "diabetes": false, "gestante": false}'),
('880e8400-e29b-41d4-a716-446655440006', 'Roberto Silva Nascimento', '1985-05-18', 'masculino', '660e8400-e29b-41d4-a716-446655440006', '3_5_salarios', 'superior_completo', 16, 72.5, 1.75, '{"imc": 23.7, "pressao_arterial": "normal", "diabetes": false, "atividade_fisica": true}'),
('880e8400-e29b-41d4-a716-446655440007', 'Juliana Ferreira Rocha', '1990-12-25', 'feminino', '660e8400-e29b-41d4-a716-446655440007', '2_3_salarios', 'pos_graduacao', 18, 55.2, 1.62, '{"imc": 21.0, "pressao_arterial": "normal", "diabetes": false, "vegetariana": true}'),
('880e8400-e29b-41d4-a716-446655440008', 'Antonio Carlos Mendes', '1975-08-14', 'masculino', '660e8400-e29b-41d4-a716-446655440008', 'ate_1_salario', 'sem_escolaridade', 0, 68.9, 1.68, '{"imc": 24.4, "pressao_arterial": "alta", "diabetes": false, "fumante": true}'),
('880e8400-e29b-41d4-a716-446655440009', 'Patrícia Gomes Barbosa', '1987-04-03', 'feminino', '660e8400-e29b-41d4-a716-446655440009', '1_2_salarios', 'medio_completo', 12, 70.1, 1.68, '{"imc": 24.8, "pressao_arterial": "normal", "diabetes": false, "mae_solteira": true}'),
('880e8400-e29b-41d4-a716-446655440010', 'Ricardo Almeida Santos', '1993-10-07', 'masculino', '660e8400-e29b-41d4-a716-446655440010', 'acima_5_salarios', 'superior_completo', 16, 80.4, 1.82, '{"imc": 24.3, "pressao_arterial": "normal", "diabetes": false, "atleta": true}'),
('880e8400-e29b-41d4-a716-446655440011', 'Luciana Dias Martins', '1988-06-21', 'feminino', '660e8400-e29b-41d4-a716-446655440011', '2_3_salarios', 'superior_incompleto', 14, 63.7, 1.64, '{"imc": 23.7, "pressao_arterial": "normal", "diabetes": false, "deficiencia_auditiva": "leve"}'),
('880e8400-e29b-41d4-a716-446655440012', 'Marcos Vieira Silva', '1980-02-28', 'masculino', '660e8400-e29b-41d4-a716-446655440012', '1_2_salarios', 'fundamental_completo', 8, 75.8, 1.70, '{"imc": 26.2, "pressao_arterial": "normal", "diabetes": false, "trabalho_noturno": true}'),
('880e8400-e29b-41d4-a716-446655440013', 'Camila Rodrigues Pereira', '1994-01-16', 'feminino', '660e8400-e29b-41d4-a716-446655440001', '2_3_salarios', 'medio_completo', 12, 59.3, 1.61, '{"imc": 22.9, "pressao_arterial": "normal", "diabetes": false, "estudante_universitaria": true}'),
('880e8400-e29b-41d4-a716-446655440014', 'Paulo Henrique Costa', '1986-11-09', 'masculino', '660e8400-e29b-41d4-a716-446655440002', 'ate_1_salario', 'medio_incompleto', 10, 82.1, 1.76, '{"imc": 26.5, "pressao_arterial": "alta", "diabetes": false, "desempregado": true}'),
('880e8400-e29b-41d4-a716-446655440015', 'Gabriela Sousa Lima', '1991-07-04', 'feminino', '660e8400-e29b-41d4-a716-446655440003', '3_5_salarios', 'pos_graduacao', 18, 56.8, 1.59, '{"imc": 22.5, "pressao_arterial": "normal", "diabetes": false, "professora": true}'),
('880e8400-e29b-41d4-a716-446655440016', 'Leonardo Araujo Nunes', '1983-12-11', 'masculino', '660e8400-e29b-41d4-a716-446655440004', '1_2_salarios', 'fundamental_incompleto', 6, 71.2, 1.73, '{"imc": 23.8, "pressao_arterial": "normal", "diabetes": false, "pescador": true}'),
('880e8400-e29b-41d4-a716-446655440017', 'Vanessa Lopes Cardoso', '1996-03-27', 'feminino', '660e8400-e29b-41d4-a716-446655440005', 'ate_1_salario', 'medio_incompleto', 10, 64.5, 1.66, '{"imc": 23.4, "pressao_arterial": "normal", "diabetes": false, "jovem_mae": true}'),
('880e8400-e29b-41d4-a716-446655440018', 'Thiago Monteiro Reis', '1989-08-19', 'masculino', '660e8400-e29b-41d4-a716-446655440006', '2_3_salarios', 'superior_completo', 16, 77.9, 1.79, '{"imc": 24.3, "pressao_arterial": "normal", "diabetes": false, "engenheiro": true}'),
('880e8400-e29b-41d4-a716-446655440019', 'Beatriz Santos Moreira', '1992-05-13', 'feminino', '660e8400-e29b-41d4-a716-446655440007', '1_2_salarios', 'medio_completo', 12, 61.7, 1.63, '{"imc": 23.2, "pressao_arterial": "normal", "diabetes": false, "artesa": true}'),
('880e8400-e29b-41d4-a716-446655440020', 'Diego Fernandes Oliveira', '1984-09-06', 'masculino', '660e8400-e29b-41d4-a716-446655440008', 'ate_1_salario', 'fundamental_completo', 8, 69.4, 1.71, '{"imc": 23.7, "pressao_arterial": "normal", "diabetes": false, "ribeirinho": true}');

-- Insert Person-Project relationships (many-to-many)
INSERT INTO public.pessoa_projeto (id_pessoa, id_projeto, data_vinculacao, ativo) VALUES
-- Alfabetização Digital Jovem
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2024-01-20', true),
('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440001', '2024-01-25', true),
('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440015', '2024-05-10', true),
-- Saúde da Mulher Integral
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '2024-02-05', true),
('880e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440002', '2024-02-10', true),
-- Horta Comunitária Sustentável
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', '2024-03-05', true),
('880e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440003', '2024-03-08', true),
-- Teatro na Comunidade
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '2024-01-25', true),
('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440004', '2024-02-01', true),
-- Direitos da Criança
('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440005', '2024-02-20', true),
-- Educação Ambiental Escolar
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440006', '2024-01-15', true),
('880e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440006', '2024-01-20', true),
-- Capacitação Profissional Adultos
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440007', '2024-03-05', true),
('880e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440007', '2024-03-10', true),
-- Saúde Mental Comunitária
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440008', '2024-04-05', true),
('880e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440008', '2024-04-08', true),
-- Música para Todos (concluído)
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440009', '2023-09-10', true),
('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440009', '2023-09-15', true),
-- Reciclagem e Renda (concluído)
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440010', '2023-06-10', true),
-- Combate à Violência Doméstica
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440011', '2024-01-10', true),
-- Biblioteca Comunitária
('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440012', '2024-02-05', true),
-- Prevenção de Doenças Tropicais
('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440013', '2024-03-20', true);

-- Insert Investors (15 diverse investors)
INSERT INTO public.investidores (id, nome_investidor, tipo_investidor, contato, documento) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Fundação Educação Brasil', 'pessoa_juridica', 'contato@fedbrasil.org', '11.222.333/0001-44'),
('990e8400-e29b-41d4-a716-446655440002', 'João Carlos Silva', 'pessoa_fisica', 'joao.silva@email.com', '123.456.789-01'),
('990e8400-e29b-41d4-a716-446655440003', 'Ministério da Saúde', 'governo', 'projetos@saude.gov.br', 'MS-2024-001'),
('990e8400-e29b-41d4-a716-446655440004', 'Anônimo', 'pessoa_fisica', 'anonimo@temp.com', '000.000.000-00'),
('990e8400-e29b-41d4-a716-446655440005', 'Empresa Verde Ltda', 'pessoa_juridica', 'sustentabilidade@empresaverde.com', '22.333.444/0001-55'),
('990e8400-e29b-41d4-a716-446655440006', 'Maria Investimentos', 'pessoa_fisica', 'maria@investimentos.com', '987.654.321-09'),
('990e8400-e29b-41d4-a716-446655440007', 'UNICEF Brasil', 'organismo_internacional', 'brasil@unicef.org', 'UNICEF-BR-2024'),
('990e8400-e29b-41d4-a716-446655440008', 'Instituto Cultural SP', 'pessoa_juridica', 'projetos@institutosp.org', '33.444.555/0001-66'),
('990e8400-e29b-41d4-a716-446655440009', 'Anônimo', 'pessoa_fisica', 'temp2@email.com', '111.111.111-11'),
('990e8400-e29b-41d4-a716-446655440010', 'Banco do Futuro', 'pessoa_juridica', 'responsabilidade@bancofuturo.com', '44.555.666/0001-77'),
('990e8400-e29b-41d4-a716-446655440011', 'Secretaria de Meio Ambiente', 'governo', 'projetos@sema.gov.br', 'SEMA-2024-002'),
('990e8400-e29b-41d4-a716-446655440012', 'Carlos Roberto Mendes', 'pessoa_fisica', 'carlos.mendes@email.com', '555.666.777-88'),
('990e8400-e29b-41d4-a716-446655440013', 'ONU Mulheres', 'organismo_internacional', 'brasil@unwomen.org', 'UNWOMEN-BR-2024'),
('990e8400-e29b-41d4-a716-446655440014', 'Tech for Good', 'pessoa_juridica', 'impacto@techforgood.com', '55.666.777/0001-88'),
('990e8400-e29b-41d4-a716-446655440015', 'Anônimo', 'pessoa_fisica', 'temp3@email.com', '222.222.222-22');

-- Insert Contributions (25 contributions)
INSERT INTO public.aportes (id_investidor, id_projeto, valor_aporte, data_aporte, descricao) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 35000.00, '2024-01-10', 'Investimento em equipamentos de informática'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 15000.00, '2024-01-15', 'Doação para capacitação de instrutores'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 45000.00, '2024-02-01', 'Verba federal para saúde da mulher'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 5000.00, '2024-02-05', 'Doação anônima'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', 25000.00, '2024-03-01', 'Patrocínio para horta sustentável'),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440004', 12000.00, '2024-01-20', 'Apoio ao projeto de teatro'),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440005', 50000.00, '2024-02-15', 'Fundo UNICEF para direitos da criança'),
('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440004', 18000.00, '2024-01-25', 'Investimento em arte e cultura'),
('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440006', 8000.00, '2024-01-12', 'Doação anônima para educação ambiental'),
('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440007', 40000.00, '2024-03-01', 'Financiamento para capacitação profissional'),
('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440003', 15000.00, '2024-03-05', 'Verba governamental para meio ambiente'),
('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440008', 22000.00, '2024-04-01', 'Doação para saúde mental'),
('990e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440011', 60000.00, '2024-01-05', 'Fundo ONU para combate à violência'),
('990e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440001', 20000.00, '2024-01-18', 'Tech for Good - inclusão digital'),
('990e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440012', 30000.00, '2024-02-01', 'Doação anônima para biblioteca'),
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440015', 25000.00, '2024-05-01', 'Inclusão digital para idosos'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440006', 18000.00, '2024-01-15', 'Educação ambiental nas escolas'),
('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440012', 15000.00, '2024-02-10', 'Apoio à biblioteca comunitária'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440013', 35000.00, '2024-03-15', 'Prevenção de doenças tropicais'),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440008', 28000.00, '2024-04-05', 'UNICEF - saúde mental infantil'),
('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009', 20000.00, '2023-09-01', 'Doação anônima para música'),
('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440010', 45000.00, '2023-06-01', 'Projeto de reciclagem governamental'),
('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440011', 25000.00, '2024-01-08', 'Apoio individual ao combate à violência'),
('990e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440013', 20000.00, '2024-03-18', 'Tecnologia para prevenção de doenças'),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440007', 30000.00, '2024-03-08', 'Capacitação profissional para adultos');
