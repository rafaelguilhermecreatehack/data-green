-- Add latitude and longitude columns to comunidades table
ALTER TABLE public.comunidades 
ADD COLUMN latitude DECIMAL(10,8),
ADD COLUMN longitude DECIMAL(11,8);

-- Update existing communities with specific neighborhood coordinates
-- São Paulo neighborhoods
UPDATE public.comunidades 
SET latitude = -23.6821, longitude = -46.7800 
WHERE cidade = 'São Paulo' AND bairro = 'Capão Redondo';

-- Rio de Janeiro neighborhoods  
UPDATE public.comunidades 
SET latitude = -22.8608, longitude = -43.2096
WHERE cidade = 'Rio de Janeiro' AND bairro = 'Complexo do Alemão';

-- Add more neighborhood coordinates for common Brazilian locations
-- These are approximate coordinates for demonstration
INSERT INTO public.comunidades (cidade, estado, bairro, latitude, longitude, idh) VALUES
('São Paulo', 'SP', 'Cidade Tiradentes', -23.5986, -46.4039, 0.312),
('São Paulo', 'SP', 'Itaquera', -23.5394, -46.4563, 0.425),
('São Paulo', 'SP', 'Grajaú', -23.7461, -46.6978, 0.398),
('Rio de Janeiro', 'RJ', 'Rocinha', -22.9888, -43.2481, 0.456),
('Rio de Janeiro', 'RJ', 'Cidade de Deus', -22.9447, -43.3642, 0.389),
('Belo Horizonte', 'MG', 'Aglomerado da Serra', -19.9731, -43.9631, 0.367),
('Salvador', 'BA', 'Subúrbio Ferroviário', -12.9389, -38.4658, 0.401),
('Fortaleza', 'CE', 'Grande Bom Jardim', -3.8089, -38.6031, 0.356),
('Recife', 'PE', 'Brasília Teimosa', -8.0889, -34.8731, 0.423),
('Manaus', 'AM', 'Cidade Nova', -3.0356, -60.0631, 0.445)
ON CONFLICT (id) DO NOTHING;

-- Create index for better geospatial queries
CREATE INDEX IF NOT EXISTS idx_comunidades_coordinates ON public.comunidades(latitude, longitude);

-- Add constraint to ensure coordinates are within Brazil bounds
ALTER TABLE public.comunidades 
ADD CONSTRAINT check_brazil_coordinates 
CHECK (
  (latitude IS NULL AND longitude IS NULL) OR 
  (latitude BETWEEN -33.7 AND 5.3 AND longitude BETWEEN -73.9 AND -28.8)
);
