# Scripts SQL para Supabase - CNCU

## Instrucciones

1. Acceder al **SQL Editor** en el dashboard de Supabase
2. Ejecutar los siguientes scripts en orden
3. Para el usuario administrador, usar el método recomendado del dashboard

---

## 1. Creación de Tabla de Registros

```sql
-- Crear tabla de registros para curadores
CREATE TABLE IF NOT EXISTS public.registros (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  numero_despacho TEXT NOT NULL,
  municipio TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON public.registros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. Configuración de Seguridad (RLS)

```sql
-- Habilitar Row Level Security
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserción pública (formulario web)
CREATE POLICY "Allow public insert" ON public.registros
  FOR INSERT
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden leer (panel admin)
CREATE POLICY "Allow authenticated select" ON public.registros
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Allow authenticated update" ON public.registros
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Allow authenticated delete" ON public.registros
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

---

## 3. Índices para Optimización

```sql
-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_registros_fecha_registro ON public.registros(fecha_registro DESC);

-- Índice para búsquedas por municipio
CREATE INDEX IF NOT EXISTS idx_registros_municipio ON public.registros(municipio);

-- Índice para búsquedas por número de despacho
CREATE INDEX IF NOT EXISTS idx_registros_numero_despacho ON public.registros(numero_despacho);
```

---

## 4. Usuario Administrador

### Método Recomendado (Dashboard de Supabase)

1. Ir a **Authentication → Users**
2. Hacer clic en **"Create user"**
3. Completar:
   - **Email:** `CuradorAdmin@cncu.com`
   - **Password:** `Curador2025`
4. Hacer clic en **"Create user"**

### Método Alternativo (SQL - Solo si es necesario)

```sql
-- ADVERTENCIA: Este método es más complejo y puede no funcionar en todas las configuraciones
-- Se recomienda usar el dashboard de Supabase

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'CuradorAdmin@cncu.com',
  crypt('Curador2025', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## 5. Función de Estadísticas (Opcional)

```sql
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
```

---

## ⚠️ Notas Importantes

- **Ejecutar en orden:** Los scripts deben ejecutarse en el orden presentado
- **Usuario Admin:** Se recomienda crear el usuario administrador desde el dashboard de Supabase
- **Verificación:** Después de ejecutar, verificar que la tabla y políticas se crearon correctamente
- **Credenciales:**
  - Email: `CuradorAdmin@cncu.com`
  - Password: `Curador2025`
