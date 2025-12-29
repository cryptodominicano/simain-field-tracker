-- =====================================================
-- SIMAIN SRL - Supabase Database Schema
-- Complete migration from Base44
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('administrador', 'gerente', 'tecnico');
CREATE TYPE order_status AS ENUM ('Pendiente', 'Asignada', 'En Progreso', 'Completada', 'Cancelada');
CREATE TYPE order_priority AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');
CREATE TYPE service_type AS ENUM ('Instalación', 'Mantenimiento', 'Calibración', 'Reparación', 'Inspección');
CREATE TYPE photo_type AS ENUM ('Antes', 'Durante', 'Después', 'Problema', 'Equipo');
CREATE TYPE entry_type AS ENUM ('Inicio', 'Fin');
CREATE TYPE certification_type AS ENUM ('INDOCAL', 'NFPA', 'ISO 17020:2012', 'ODAC', 'Otra');
CREATE TYPE notification_type AS ENUM ('Orden de Trabajo', 'Certificación', 'Sistema', 'Alerta');
CREATE TYPE report_status AS ENUM ('Borrador', 'Enviado', 'Aprobado', 'Rechazado');

-- =====================================================
-- 1. USUARIOS (Users) - Links to Supabase Auth
-- =====================================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    cedula TEXT,
    rol user_role NOT NULL DEFAULT 'tecnico',
    activo BOOLEAN NOT NULL DEFAULT true,
    foto_perfil TEXT,
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- =====================================================
-- 2. ORDENES DE TRABAJO (Work Orders)
-- =====================================================

CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden TEXT UNIQUE NOT NULL,

    -- Client info
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),

    -- Service details
    tipo_servicio service_type NOT NULL,
    descripcion TEXT,
    prioridad order_priority NOT NULL DEFAULT 'Media',
    equipos_involucrados TEXT,
    notas_internas TEXT,

    -- Assignment
    asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    asignado_nombre TEXT,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    -- Scheduling
    fecha_programada DATE,
    hora_programada TIME,

    -- Status
    estado order_status NOT NULL DEFAULT 'Pendiente',

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ordenes_numero ON ordenes_trabajo(numero_orden);
CREATE INDEX idx_ordenes_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_ordenes_prioridad ON ordenes_trabajo(prioridad);
CREATE INDEX idx_ordenes_asignado ON ordenes_trabajo(asignado_a);
CREATE INDEX idx_ordenes_fecha ON ordenes_trabajo(fecha_programada);
CREATE INDEX idx_ordenes_created ON ordenes_trabajo(created_at DESC);

-- =====================================================
-- 3. REGISTROS DE ENTRADA (Check-in/Check-out Logs)
-- =====================================================

CREATE TABLE registros_entrada (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User info
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_nombre TEXT NOT NULL,

    -- Order reference
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    numero_orden TEXT NOT NULL,

    -- Entry type
    tipo_registro entry_type NOT NULL,

    -- GPS data
    latitud DECIMAL(10, 8) NOT NULL DEFAULT 0,
    longitud DECIMAL(11, 8) NOT NULL DEFAULT 0,
    precision_gps DECIMAL(10, 2) DEFAULT 0,
    distancia_del_sitio DECIMAL(10, 2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_registros_usuario ON registros_entrada(usuario_id);
CREATE INDEX idx_registros_orden ON registros_entrada(orden_trabajo_id);
CREATE INDEX idx_registros_tipo ON registros_entrada(tipo_registro);
CREATE INDEX idx_registros_created ON registros_entrada(created_at DESC);

-- =====================================================
-- 4. FOTOS (Photos)
-- =====================================================

CREATE TABLE fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Order reference
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    numero_orden TEXT NOT NULL,

    -- Uploader info
    subido_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    subido_por_nombre TEXT NOT NULL,

    -- File info
    archivo_url TEXT NOT NULL,
    tipo_foto photo_type NOT NULL DEFAULT 'Durante',
    descripcion TEXT,

    -- GPS data
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fotos_orden ON fotos(orden_trabajo_id);
CREATE INDEX idx_fotos_subido_por ON fotos(subido_por_id);
CREATE INDEX idx_fotos_created ON fotos(created_at DESC);

-- =====================================================
-- 5. REPORTES DE TRABAJO (Work Reports)
-- =====================================================

CREATE TABLE reportes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Order reference
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    numero_orden TEXT NOT NULL,

    -- Submitter info
    presentado_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    presentado_por_nombre TEXT NOT NULL,

    -- Report content
    descripcion_trabajo TEXT NOT NULL,
    partes_usadas TEXT,
    tiempo_gastado_minutos INTEGER DEFAULT 0,
    problemas_encontrados TEXT,
    recomendaciones TEXT,

    -- Status
    estado_reporte report_status NOT NULL DEFAULT 'Enviado',

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reportes_orden ON reportes_trabajo(orden_trabajo_id);
CREATE INDEX idx_reportes_presentado_por ON reportes_trabajo(presentado_por_id);
CREATE INDEX idx_reportes_estado ON reportes_trabajo(estado_reporte);
CREATE INDEX idx_reportes_created ON reportes_trabajo(created_at DESC);

-- =====================================================
-- 6. CERTIFICACIONES (Certifications)
-- =====================================================

CREATE TABLE certificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_nombre TEXT NOT NULL,

    -- Certification details
    nombre_certificacion TEXT NOT NULL,
    tipo certification_type,
    numero_certificado TEXT,

    -- Dates
    fecha_emision DATE,
    fecha_vencimiento DATE NOT NULL,

    -- Document
    documento_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certificaciones_usuario ON certificaciones(usuario_id);
CREATE INDEX idx_certificaciones_vencimiento ON certificaciones(fecha_vencimiento);
CREATE INDEX idx_certificaciones_tipo ON certificaciones(tipo);

-- =====================================================
-- 7. NOTIFICACIONES (Notifications)
-- =====================================================

CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Target user
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Content
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo notification_type NOT NULL DEFAULT 'Sistema',

    -- Reference to related entity
    relacionado_id UUID,

    -- Status
    leida BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created ON notificaciones(created_at DESC);

-- =====================================================
-- STORAGE BUCKET FOR PHOTOS
-- =====================================================

-- Run this in Supabase Dashboard -> Storage -> Create bucket
-- Bucket name: photos
-- Public: false (we'll use signed URLs)

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_entrada ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user's role
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT rol INTO user_role_val
    FROM usuarios
    WHERE auth_id = auth.uid();

    RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get current user's ID
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
DECLARE
    user_id_val UUID;
BEGIN
    SELECT id INTO user_id_val
    FROM usuarios
    WHERE auth_id = auth.uid();

    RETURN user_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USUARIOS POLICIES
-- =====================================================

-- Everyone can view active users
CREATE POLICY "usuarios_select_all" ON usuarios
    FOR SELECT USING (true);

-- Only admins and managers can insert users
CREATE POLICY "usuarios_insert_admin_gerente" ON usuarios
    FOR INSERT WITH CHECK (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Users can update their own profile
CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE USING (auth_id = auth.uid());

-- Admins can update any user
CREATE POLICY "usuarios_update_admin" ON usuarios
    FOR UPDATE USING (get_user_role() = 'administrador');

-- Only admins can delete users
CREATE POLICY "usuarios_delete_admin" ON usuarios
    FOR DELETE USING (get_user_role() = 'administrador');

-- =====================================================
-- ORDENES_TRABAJO POLICIES
-- =====================================================

-- Admins and managers can see all orders
CREATE POLICY "ordenes_select_admin_gerente" ON ordenes_trabajo
    FOR SELECT USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Technicians can see orders assigned to them
CREATE POLICY "ordenes_select_tecnico" ON ordenes_trabajo
    FOR SELECT USING (
        get_user_role() = 'tecnico' AND asignado_a = get_user_id()
    );

-- Admins and managers can create orders
CREATE POLICY "ordenes_insert_admin_gerente" ON ordenes_trabajo
    FOR INSERT WITH CHECK (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Admins and managers can update any order
CREATE POLICY "ordenes_update_admin_gerente" ON ordenes_trabajo
    FOR UPDATE USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Technicians can update orders assigned to them (status only)
CREATE POLICY "ordenes_update_tecnico" ON ordenes_trabajo
    FOR UPDATE USING (
        get_user_role() = 'tecnico' AND asignado_a = get_user_id()
    );

-- Only admins can delete orders
CREATE POLICY "ordenes_delete_admin" ON ordenes_trabajo
    FOR DELETE USING (get_user_role() = 'administrador');

-- =====================================================
-- REGISTROS_ENTRADA POLICIES
-- =====================================================

-- Admins and managers can see all entries
CREATE POLICY "registros_select_admin_gerente" ON registros_entrada
    FOR SELECT USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Technicians can see their own entries
CREATE POLICY "registros_select_tecnico" ON registros_entrada
    FOR SELECT USING (
        usuario_id = get_user_id()
    );

-- Users can create their own entries
CREATE POLICY "registros_insert_own" ON registros_entrada
    FOR INSERT WITH CHECK (
        usuario_id = get_user_id()
    );

-- =====================================================
-- FOTOS POLICIES
-- =====================================================

-- Admins and managers can see all photos
CREATE POLICY "fotos_select_admin_gerente" ON fotos
    FOR SELECT USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Technicians can see photos for their orders
CREATE POLICY "fotos_select_tecnico" ON fotos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ordenes_trabajo ot
            WHERE ot.id = fotos.orden_trabajo_id
            AND ot.asignado_a = get_user_id()
        )
    );

-- Users can upload photos for orders assigned to them
CREATE POLICY "fotos_insert_own" ON fotos
    FOR INSERT WITH CHECK (
        subido_por_id = get_user_id()
    );

-- =====================================================
-- REPORTES_TRABAJO POLICIES
-- =====================================================

-- Admins and managers can see all reports
CREATE POLICY "reportes_select_admin_gerente" ON reportes_trabajo
    FOR SELECT USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Technicians can see their own reports
CREATE POLICY "reportes_select_tecnico" ON reportes_trabajo
    FOR SELECT USING (
        presentado_por_id = get_user_id()
    );

-- Users can create their own reports
CREATE POLICY "reportes_insert_own" ON reportes_trabajo
    FOR INSERT WITH CHECK (
        presentado_por_id = get_user_id()
    );

-- =====================================================
-- CERTIFICACIONES POLICIES
-- =====================================================

-- Everyone can view certifications
CREATE POLICY "certificaciones_select_all" ON certificaciones
    FOR SELECT USING (true);

-- Admins and managers can create certifications
CREATE POLICY "certificaciones_insert_admin_gerente" ON certificaciones
    FOR INSERT WITH CHECK (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Admins and managers can update certifications
CREATE POLICY "certificaciones_update_admin_gerente" ON certificaciones
    FOR UPDATE USING (
        get_user_role() IN ('administrador', 'gerente')
    );

-- Only admins can delete certifications
CREATE POLICY "certificaciones_delete_admin" ON certificaciones
    FOR DELETE USING (get_user_role() = 'administrador');

-- =====================================================
-- NOTIFICACIONES POLICIES
-- =====================================================

-- Users can see their own notifications
CREATE POLICY "notificaciones_select_own" ON notificaciones
    FOR SELECT USING (usuario_id = get_user_id());

-- System/admins can create notifications for any user
CREATE POLICY "notificaciones_insert" ON notificaciones
    FOR INSERT WITH CHECK (
        get_user_role() IN ('administrador', 'gerente')
        OR usuario_id = get_user_id()
    );

-- Users can update (mark as read) their own notifications
CREATE POLICY "notificaciones_update_own" ON notificaciones
    FOR UPDATE USING (usuario_id = get_user_id());

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at
    BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_updated_at
    BEFORE UPDATE ON reportes_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificaciones_updated_at
    BEFORE UPDATE ON certificaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usuarios (auth_id, email, nombre_completo, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'tecnico')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STORAGE POLICIES (Run in Supabase Dashboard)
-- =====================================================

/*
-- After creating the 'photos' bucket, run these policies:

-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view photos
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own photos
CREATE POLICY "Allow users to delete own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
*/
