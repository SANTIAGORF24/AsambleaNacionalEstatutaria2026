# Sistema de Registro - Colegio Nacional de Curadores Urbanos

Este proyecto es una aplicación web para el registro de curadores urbanos para la **ASAMBLEA NACIONAL ESTATUTARIA** del CNCU.

## 📋 Información de la Asamblea

**ASAMBLEA NACIONAL ESTATUTARIA**

- **Fecha:** Viernes 20 de marzo
- **Horario:** 8:00 a.m. - 6:00 p.m.
- **Lugar:** Santa Marta
- **Sede:** Salón "Arrecifes" Torre 2
- **Hotel:** Zuana Beach Resort
- **Dirección:** Carrera 2 # 6 – 80

## 🚀 Tecnologías Utilizadas

- **Next.js 16** (React 19)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animaciones)
- **Supabase** (base de datos y autenticación)
- **XLSX** (exportación de datos)

## 🔧 Configuración del Proyecto

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` con:

```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qbqnfsohekrobqbsbont.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r5mFX8tjYMnOPul95B8leQ_PwfM6EBU

# Configuración de base de datos (solo para referencia)
DATABASE_URL=postgresql://postgres:invitacion2@db.qbqnfsohekrobqbsbont.supabase.co:5432/postgres
```

### 3. Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Configuración de Supabase

### Información de Conexión

- **URL del Proyecto:** https://qbqnfsohekrobqbsbont.supabase.co
- **Contraseña de Base de Datos:** invitacion2
- **URL de Conexión Completa:**
  ```
  postgresql://postgres:invitacion2@db.qbqnfsohekrobqbsbont.supabase.co:5432/postgres
  ```

### Usuario Administrador

Para acceder al panel de administración (`/login`):

- **Email:** CuradorAdmin@cncu.com
- **Contraseña:** Curador2025

### Configuración Inicial de la Base de Datos

1. **Acceder a Supabase Dashboard:** https://app.supabase.com/
2. **Ir al SQL Editor**
3. **Ejecutar el script completo** que se encuentra en `/scripts/001_create_registros.sql`

### Crear Usuario Administrador

En el dashboard de Supabase:

1. Ir a **Authentication → Users**
2. Hacer clic en **"Create user"**
3. Completar los datos:
   - **Email:** CuradorAdmin@cncu.com
   - **Password:** Curador2025
4. Hacer clic en **"Create user"**

## 📊 Estructura de la Base de Datos

### Tabla: `registros`

```sql
CREATE TABLE public.registros (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  numero_despacho TEXT NOT NULL,
  municipio TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas de Seguridad (RLS)

- **Inserción pública:** Cualquier usuario puede registrarse
- **Lectura restringida:** Solo usuarios autenticados pueden ver los registros
- **Actualización/Eliminación:** Solo usuarios autenticados

## 🌐 Páginas del Sistema

### Página Principal (`/`)

- **Formulario de registro** para curadores
- **Información de la asamblea**
- **Formateo automático** de nombres y municipios (formato: "Santiago Ramirez Forero")
- **Envío de datos** a Supabase

### Panel de Administración (`/login`)

- **Acceso restringido** solo por URL directa
- **Autenticación** con usuario administrador
- **Vista de tabla** con todos los registros
- **Exportación a Excel** de todos los datos
- **Interfaz administrativa** completa

## 📁 Estructura del Proyecto

```
/app
  /login
    page.tsx          # Panel de administración
  layout.tsx          # Layout principal
  page.tsx           # Página de registro principal
  globals.css        # Estilos globales

/lib
  /supabase
    client.ts         # Cliente de Supabase (browser)
    server.ts         # Cliente de Supabase (server)

/scripts
  001_create_registros.sql  # Script SQL para configuración

/components
  ui/                 # Componentes de UI reutilizables
```

## ⭐ Funcionalidades

### Formateo Automático de Texto

- **Nombres completos:** Primera letra en mayúscula, resto en minúscula
- **Municipios:** Mismo formato que nombres
- **Ejemplo:** "santiago ramirez forero" → "Santiago Ramirez Forero"

### Validaciones

- **Nombre completo:** Solo letras y espacios
- **Número de despacho:** Solo números
- **Municipio:** Solo letras y espacios
- **Campos obligatorios:** Todos los campos requeridos

### Panel de Administración

- **Autenticación segura**
- **Vista de todos los registros**
- **Exportación a Excel** (.xlsx)
- **Interfaz responsive**
- **Cierre de sesión seguro**

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado
- **Políticas de acceso** configuradas
- **Variables de entorno** para credenciales
- **Autenticación JWT** con Supabase

## 📈 Exportación de Datos

El sistema permite exportar todos los registros a Excel con las siguientes columnas:

- ID
- Nombre Completo
- Número de Despacho
- Municipio
- Fecha de Registro (formato: DD/MM/AAAA HH:MM)

## 🚨 Comandos Útiles

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar versión de producción
npm run lint         # Análisis de código
```

### Base de Datos

```bash
# Conectar a Supabase desde terminal
psql "postgresql://postgres:invitacion2@db.qbqnfsohekrobqbsbont.supabase.co:5432/postgres"
```

## 📞 Soporte

Para cualquier problema técnico o consulta sobre el sistema, contactar al administrador del proyecto.

---

**© 2026 Colegio Nacional de Curadores Urbanos**
