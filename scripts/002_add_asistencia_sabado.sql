-- ===================================
-- MIGRACIÓN: Agregar campo asistencia_sabado
-- Colegio Nacional de Curadores Urbanos
-- ===================================

-- Agregar columna para registrar la asistencia al día de playa (sábado 21 de marzo)
-- Valores posibles:
--   'solo_viernes' - Solo asistirá el viernes
--   'viernes_y_sabado' - Asistirá viernes y sábado
--   'no_asistire' - No asistirá al evento

ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS asistencia_sabado TEXT;

-- Opcional: Agregar comentario a la columna para documentación
COMMENT ON COLUMN public.registros.asistencia_sabado IS 'Indica la asistencia del curador: solo_viernes, viernes_y_sabado, no_asistire';

-- Verificar que la columna se agregó correctamente
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registros';
