-- ===================================
-- CONFIGURACIÓN COMPLETA PARA SUPABASE
-- Colegio Nacional de Curadores Urbanos
-- ===================================

-- 1. Crear tabla de registros para curadores
CREATE TABLE IF NOT EXISTS public.registros (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  numero_despacho TEXT NOT NULL,
  municipio TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Crear trigger para actualizar updated_at
CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON public.registros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Habilitar Row Level Security
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- 5. Política: Permitir inserción pública (formulario web)
CREATE POLICY "Allow public insert" ON public.registros 
  FOR INSERT 
  WITH CHECK (true);

-- 6. Política: Solo usuarios autenticados pueden leer (panel admin)
CREATE POLICY "Allow authenticated select" ON public.registros 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 7. Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Allow authenticated update" ON public.registros 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- 8. Política: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Allow authenticated delete" ON public.registros 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- ===================================
-- CONFIGURACIÓN DEL USUARIO ADMINISTRADOR
-- ===================================

-- IMPORTANTE: Este script debe ejecutarse en el SQL Editor de Supabase
-- después de crear el proyecto.

-- Para crear el usuario administrador, ejecutar este comando en el dashboard de Supabase:
-- 1. Ir a Authentication -> Users
-- 2. Crear nuevo usuario con:
--    Email: CuradorAdmin@cncu.com
--    Password: Curador2025
-- 3. O usar este SQL en el editor:

-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'CuradorAdmin@cncu.com',
--   crypt('Curador2025', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"]}',
--   '{"role":"admin"}',
--   NOW(),
--   NOW(),
--   '',
--   '',
--   '',
--   ''
-- );

-- ===================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_registros_fecha_registro ON public.registros(fecha_registro DESC);

-- Índice para búsquedas por municipio
CREATE INDEX IF NOT EXISTS idx_registros_municipio ON public.registros(municipio);

-- Índice para búsquedas por número de despacho
CREATE INDEX IF NOT EXISTS idx_registros_numero_despacho ON public.registros(numero_despacho);

-- ===================================
-- FUNCIÓN PARA ESTADÍSTICAS (OPCIONAL)
-- ===================================

CREATE OR REPLACE FUNCTION get_registros_stats()
RETURNS TABLE(
  total_registros BIGINT,
  registros_hoy BIGINT,
  registros_esta_semana BIGINT,
  municipios_unicos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.registros) as total_registros,
    (SELECT COUNT(*) FROM public.registros WHERE fecha_registro::DATE = CURRENT_DATE) as registros_hoy,
    (SELECT COUNT(*) FROM public.registros WHERE fecha_registro >= CURRENT_DATE - INTERVAL '7 days') as registros_esta_semana,
    (SELECT COUNT(DISTINCT municipio) FROM public.registros) as municipios_unicos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
