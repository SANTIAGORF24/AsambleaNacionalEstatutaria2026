-- ===================================
-- MIGRACIÓN: Nuevos campos confirmación, asamblea, poder y sábado
-- Colegio Nacional de Curadores Urbanos
-- ===================================

-- 1. Confirmación general de asistencia a los eventos
--    Valores: 'si' | 'no'
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS confirmacion_asistencia TEXT;

-- 2. Asistencia específica a la Asamblea Nacional Estatutaria
--    Valores: 'si' | 'no'
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS asistencia_asamblea TEXT;

-- 3. Si no asiste a la asamblea, ¿envía poder?
--    Valores: 'si' | 'no' | NULL (cuando sí asiste)
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS envia_poder TEXT;

-- 4. Nombre de la persona a quien otorga el poder (voz y voto)
--    NULL si no aplica
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS persona_poder TEXT;

-- 5. Asistencia al tour marítimo del sábado 21 de marzo
--    Valores: 'si' | 'no'
--    (renombrado conceptualmente; si ya existe asistencia_sabado se mantiene compatible)
-- Si la columna asistencia_sabado ya existe (migración 002), no hace falta recrearla.
-- Solo aseguramos que exista:
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS asistencia_sabado TEXT;

-- 6. Número de acompañantes para el sábado
--    0 = va solo, NULL = no asiste al tour
ALTER TABLE public.registros
ADD COLUMN IF NOT EXISTS acompanantes_sabado INTEGER;

-- Comentarios de documentación
COMMENT ON COLUMN public.registros.confirmacion_asistencia IS 'Confirma asistencia general: si | no';
COMMENT ON COLUMN public.registros.asistencia_asamblea IS 'Asiste a la Asamblea Nacional Estatutaria: si | no';
COMMENT ON COLUMN public.registros.envia_poder IS 'Envía poder cuando no asiste a la asamblea: si | no | NULL';
COMMENT ON COLUMN public.registros.persona_poder IS 'Nombre de quien recibe el poder para voz y voto';
COMMENT ON COLUMN public.registros.asistencia_sabado IS 'Asiste al tour marítimo del sábado: si | no';
COMMENT ON COLUMN public.registros.acompanantes_sabado IS 'Número de acompañantes para el sábado (0 = va solo, NULL = no asiste)';

-- Índices útiles para el panel admin
CREATE INDEX IF NOT EXISTS idx_registros_confirmacion ON public.registros(confirmacion_asistencia);
CREATE INDEX IF NOT EXISTS idx_registros_asistencia_asamblea ON public.registros(asistencia_asamblea);
CREATE INDEX IF NOT EXISTS idx_registros_asistencia_sabado ON public.registros(asistencia_sabado);

-- Verificar columnas resultantes:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registros' ORDER BY ordinal_position;
