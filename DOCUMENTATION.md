# SIMAIN SRL - Field Service Tracker

## Technical Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Services](#api-services)
7. [Pages & Components](#pages--components)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Deployment](#deployment)
10. [Environment Variables](#environment-variables)
11. [Migration History](#migration-history)
12. [Seed Data](#seed-data)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**SIMAIN SRL Field Service Tracker** is a comprehensive field service management application designed for managing work orders, technicians, certifications, and real-time field tracking for an industrial calibration and maintenance company based in the Dominican Republic.

### Key Features

- **Work Order Management**: Create, assign, track, and complete work orders
- **Technician Tracking**: Real-time GPS tracking of technicians in the field
- **Check-in/Check-out System**: GPS-verified arrival and departure logging
- **Photo Documentation**: Before, during, and after photos for work orders
- **Work Reports**: Detailed service reports with parts used, time spent, and recommendations
- **Certification Management**: Track technician certifications and expiration dates
- **Notifications**: Real-time alerts for assignments, completions, and certification expirations
- **Analytics & Reports**: Dashboard with KPIs and performance metrics
- **Multi-role Access**: Different dashboards for Administrators, Managers, and Technicians

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 6.4.1 | Build Tool & Dev Server |
| React Router DOM | 7.6.0 | Client-side Routing |
| TailwindCSS | 3.4.17 | Utility-first CSS Framework |
| Radix UI | Various | Headless UI Components |
| Lucide React | 0.474.0 | Icon Library |
| React Query | @tanstack/react-query | Data Fetching & Caching |
| React Leaflet | 4.x | Interactive Maps |
| Sonner | - | Toast Notifications |
| Recharts | - | Charts & Analytics |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database (via Supabase) |
| Supabase Auth | Authentication |
| Supabase Storage | File Storage (Photos) |
| Row Level Security (RLS) | Data Access Control |

### Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting & CDN |
| GitHub | Source Control |
| Supabase Cloud | Database & Auth Hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   (React + Vite + Tailwind)                  │
│                    Hosted on Vercel                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTPS
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      SUPABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  Database   │  │      Storage        │  │
│  │  (Email/    │  │ (PostgreSQL)│  │  (Photos Bucket)    │  │
│  │  Password)  │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                   Row Level Security                         │
│                      (RLS Policies)                          │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
SimainSRL/
├── public/
│   └── signon-logo.png          # Company logo
├── src/
│   ├── api/
│   │   ├── index.js             # Main API exports
│   │   ├── auth.js              # Authentication service
│   │   ├── storage.js           # File upload service
│   │   ├── supabaseClient.js    # Supabase client config
│   │   └── services/
│   │       ├── baseService.js   # Generic CRUD service factory
│   │       └── index.js         # Entity service exports
│   ├── components/
│   │   └── ui/                  # Radix UI components (shadcn/ui)
│   ├── contexts/
│   │   └── AuthContext.jsx      # Auth state management
│   ├── hooks/
│   │   └── useUserProfile.js    # User profile hook
│   ├── lib/
│   │   └── utils.js             # Utility functions
│   ├── pages/
│   │   ├── index.jsx            # Router & App entry
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Login.jsx            # Login page
│   │   ├── DashboardGerente.jsx # Manager dashboard
│   │   ├── DashboardTecnico.jsx # Technician dashboard
│   │   ├── CrearOrden.jsx       # Create work order
│   │   ├── DetalleOrden.jsx     # Work order details
│   │   ├── OrdenesTrabajoList.jsx # Work orders list
│   │   ├── MisOrdenes.jsx       # Technician's orders
│   │   ├── CompletarReporte.jsx # Complete work report
│   │   ├── VerReporte.jsx       # View work report
│   │   ├── Perfil.jsx           # User profile
│   │   ├── GestionUsuarios.jsx  # User management
│   │   ├── GestionTecnicos.jsx  # Technician management
│   │   ├── CertificacionesEquipo.jsx # Team certifications
│   │   ├── MisCertificaciones.jsx # My certifications
│   │   ├── Notificaciones.jsx   # Notifications
│   │   ├── MapaTecnicos.jsx     # Live technician map
│   │   └── ReportesAnalisis.jsx # Reports & analytics
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── supabase/
│   └── schema.sql               # Database schema
├── .env.local                   # Environment variables (local)
├── .env.example                 # Environment template
├── vercel.json                  # Vercel deployment config
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── package.json                 # Dependencies
└── DOCUMENTATION.md             # This file
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌─────────────────┐
│   usuarios   │       │  ordenes_trabajo  │       │ registros_entrada│
│──────────────│       │───────────────────│       │─────────────────│
│ id (PK)      │◄──────│ asignado_a (FK)   │       │ id (PK)         │
│ auth_id (FK) │       │ creado_por (FK)   │◄──────│ orden_trabajo_id│
│ email        │       │ numero_orden      │       │ usuario_id (FK) │
│ nombre       │       │ cliente_nombre    │       │ tipo_registro   │
│ rol          │       │ direccion         │       │ latitud         │
│ activo       │       │ latitud/longitud  │       │ longitud        │
└──────────────┘       │ tipo_servicio     │       └─────────────────┘
       │               │ estado            │
       │               │ prioridad         │              ┌──────────┐
       │               └───────────────────┘              │  fotos   │
       │                        │                         │──────────│
       │                        │                         │ id (PK)  │
       │               ┌────────▼────────┐                │ orden_id │
       │               │ reportes_trabajo │◄──────────────│ url      │
       │               │─────────────────│                │ tipo     │
       │               │ id (PK)         │                └──────────┘
       │               │ orden_trabajo_id│
       │               │ presentado_por  │
       │               │ descripcion     │
       │               └─────────────────┘
       │
       │    ┌────────────────┐        ┌────────────────┐
       └────│ certificaciones│        │ notificaciones │
            │────────────────│        │────────────────│
            │ id (PK)        │        │ id (PK)        │
            │ usuario_id(FK) │        │ usuario_id(FK) │
            │ nombre_cert    │        │ titulo         │
            │ tipo           │        │ mensaje        │
            │ vencimiento    │        │ leida          │
            └────────────────┘        └────────────────┘
```

### Tables

#### 1. usuarios (Users)
Links to Supabase Auth and stores user profile data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| auth_id | UUID | Reference to auth.users |
| email | TEXT | User email (unique) |
| nombre_completo | TEXT | Full name |
| telefono | TEXT | Phone number |
| cedula | TEXT | National ID |
| rol | user_role | Role (administrador, gerente, tecnico) |
| activo | BOOLEAN | Active status |
| foto_perfil | TEXT | Profile photo URL |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### 2. ordenes_trabajo (Work Orders)
Main work order/job tracking table.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| numero_orden | TEXT | Order number (unique) |
| cliente_nombre | TEXT | Client name |
| cliente_telefono | TEXT | Client phone |
| direccion | TEXT | Service address |
| latitud | DECIMAL | GPS latitude |
| longitud | DECIMAL | GPS longitude |
| tipo_servicio | service_type | Service type |
| descripcion | TEXT | Job description |
| prioridad | order_priority | Priority level |
| estado | order_status | Current status |
| asignado_a | UUID | Assigned technician (FK) |
| asignado_nombre | TEXT | Assigned tech name (denormalized) |
| creado_por | UUID | Created by (FK) |
| fecha_programada | DATE | Scheduled date |
| hora_programada | TIME | Scheduled time |
| equipos_involucrados | TEXT | Equipment involved |
| notas_internas | TEXT | Internal notes |

#### 3. registros_entrada (Check-in/Check-out Logs)
GPS-verified arrival and departure records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| usuario_id | UUID | Technician (FK) |
| usuario_nombre | TEXT | Tech name (denormalized) |
| orden_trabajo_id | UUID | Work order (FK) |
| numero_orden | TEXT | Order number |
| tipo_registro | entry_type | 'Inicio' or 'Fin' |
| latitud | DECIMAL | GPS latitude |
| longitud | DECIMAL | GPS longitude |
| precision_gps | DECIMAL | GPS accuracy in meters |
| distancia_del_sitio | DECIMAL | Distance from job site |

#### 4. fotos (Photos)
Photo documentation for work orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| orden_trabajo_id | UUID | Work order (FK) |
| numero_orden | TEXT | Order number |
| subido_por_id | UUID | Uploader (FK) |
| subido_por_nombre | TEXT | Uploader name |
| archivo_url | TEXT | Supabase Storage URL |
| tipo_foto | photo_type | Photo category |
| descripcion | TEXT | Photo description |
| latitud | DECIMAL | GPS where taken |
| longitud | DECIMAL | GPS where taken |

#### 5. reportes_trabajo (Work Reports)
Detailed service completion reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| orden_trabajo_id | UUID | Work order (FK) |
| numero_orden | TEXT | Order number |
| presentado_por_id | UUID | Submitted by (FK) |
| presentado_por_nombre | TEXT | Submitter name |
| descripcion_trabajo | TEXT | Work description |
| partes_usadas | TEXT | Parts/materials used |
| tiempo_gastado_minutos | INTEGER | Time spent (minutes) |
| problemas_encontrados | TEXT | Issues found |
| recomendaciones | TEXT | Recommendations |
| estado_reporte | report_status | Report status |

#### 6. certificaciones (Certifications)
Technician certification tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| usuario_id | UUID | Technician (FK) |
| usuario_nombre | TEXT | Tech name |
| nombre_certificacion | TEXT | Certification name |
| tipo | certification_type | Cert type (INDOCAL, NFPA, etc.) |
| numero_certificado | TEXT | Certificate number |
| fecha_emision | DATE | Issue date |
| fecha_vencimiento | DATE | Expiration date |
| documento_url | TEXT | Document file URL |

#### 7. notificaciones (Notifications)
User notification system.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| usuario_id | UUID | Target user (FK) |
| titulo | TEXT | Notification title |
| mensaje | TEXT | Message content |
| tipo | notification_type | Notification category |
| relacionado_id | UUID | Related entity ID |
| leida | BOOLEAN | Read status |

### Enum Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('administrador', 'gerente', 'tecnico');

-- Work order status
CREATE TYPE order_status AS ENUM ('Pendiente', 'Asignada', 'En Progreso', 'Completada', 'Cancelada');

-- Priority levels
CREATE TYPE order_priority AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');

-- Service types
CREATE TYPE service_type AS ENUM ('Instalación', 'Mantenimiento', 'Calibración', 'Reparación', 'Inspección');

-- Photo categories
CREATE TYPE photo_type AS ENUM ('Antes', 'Durante', 'Después', 'Problema', 'Equipo');

-- Check-in types
CREATE TYPE entry_type AS ENUM ('Inicio', 'Fin');

-- Certification types
CREATE TYPE certification_type AS ENUM ('INDOCAL', 'NFPA', 'ISO 17020:2012', 'ODAC', 'Otra');

-- Notification types
CREATE TYPE notification_type AS ENUM ('Orden de Trabajo', 'Certificación', 'Sistema', 'Alerta');

-- Report status
CREATE TYPE report_status AS ENUM ('Borrador', 'Enviado', 'Aprobado', 'Rechazado');
```

---

## Authentication & Authorization

### Authentication Flow

1. User submits email/password on Login page
2. `auth.signIn()` calls Supabase Auth
3. On success, Supabase returns JWT token and user session
4. `AuthContext` listens to auth state changes
5. User profile is fetched from `usuarios` table
6. User is redirected based on role

### AuthContext Provider

Located at `src/contexts/AuthContext.jsx`:

```javascript
// Provides:
- user: Supabase auth user object
- userProfile: User data from usuarios table
- loading: Auth loading state
- signIn(): Login function
- signOut(): Logout function
```

### Auto User Profile Creation

A database trigger automatically creates a user profile when a new auth user signs up:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_id, email, nombre_completo, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
        'tecnico'::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## API Services

### Base Service Factory

`src/api/services/baseService.js` creates CRUD services for each entity:

```javascript
createEntityService(tableName) {
  return {
    list(sortBy, limit),      // Get all records
    filter(conditions),       // Filter records
    get(id),                  // Get single record
    create(data),             // Create new record
    update(id, data),         // Update record
    delete(id)                // Delete record
  }
}
```

### Available Entity Services

```javascript
import { entities } from '@/api';

// Available entities:
entities.usuarios          // User profiles
entities.ordenes_trabajo   // Work orders
entities.registros_entrada // Check-in logs
entities.fotos             // Photos
entities.reportes_trabajo  // Work reports
entities.certificaciones   // Certifications
entities.notificaciones    // Notifications
```

### Storage Service

`src/api/storage.js` handles file uploads:

```javascript
import { storage } from '@/api';

// Upload a file
const result = await storage.uploadFile({ file });
// Returns: { file_path, public_url }

// Get signed URL
const url = await storage.createSignedUrl({ file_path, expires_in });
```

---

## User Roles & Permissions

### Role Hierarchy

```
Administrador (Admin)
    └── Full system access
    └── User management
    └── All orders and reports
    └── System configuration

Gerente (Manager)
    └── Create/assign work orders
    └── View all technicians
    └── Approve reports
    └── View analytics
    └── Manage certifications

Técnico (Technician)
    └── View assigned orders only
    └── Check-in/Check-out
    └── Upload photos
    └── Submit reports
    └── View own certifications
```

### Row Level Security (RLS) Policies

All tables have RLS enabled. Key policies:

**usuarios:**
- Everyone can view active users
- Admins/managers can create users
- Users can update own profile
- Only admins can delete users

**ordenes_trabajo:**
- Admins/managers see all orders
- Technicians see only assigned orders
- Admins/managers can create/update
- Technicians can update status of assigned orders

**registros_entrada:**
- Admins/managers see all entries
- Technicians see own entries
- Users create own entries only

**notificaciones:**
- Users see own notifications only
- Users can mark own as read

---

## Pages & Components

### Public Pages

| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | Email/password authentication |

### Manager/Admin Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/DashboardGerente` | KPIs, recent orders, live map link |
| Work Orders | `/OrdenesTrabajoList` | All work orders list |
| Create Order | `/CrearOrden` | New work order form |
| Order Details | `/DetalleOrden/:id` | View/edit order details |
| Live Map | `/MapaTecnicos` | Real-time technician locations |
| Technicians | `/GestionTecnicos` | Manage technicians |
| Users | `/GestionUsuarios` | User management |
| Certifications | `/CertificacionesEquipo` | Team certifications |
| Reports | `/ReportesAnalisis` | Analytics dashboard |
| Notifications | `/Notificaciones` | System notifications |
| Profile | `/Perfil` | User profile |

### Technician Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/DashboardTecnico` | Assigned orders, schedule |
| My Orders | `/MisOrdenes` | Technician's work orders |
| Order Details | `/DetalleOrden/:id` | Order info, check-in/out |
| Complete Report | `/CompletarReporte/:id` | Submit work report |
| View Report | `/VerReporte/:id` | View submitted report |
| My Certifications | `/MisCertificaciones` | Personal certifications |
| Notifications | `/Notificaciones` | Personal notifications |
| Profile | `/Perfil` | User profile |

---

## Deployment

### Vercel Configuration

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/((?!api/.*).*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Deployment Steps

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel
4. Deploy automatically on push to main

### URLs

- **Production**: https://simain-field-tracker.vercel.app
- **GitHub**: https://github.com/cryptodominicano/simain-field-tracker

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Local Development

Create `.env.local`:
```env
VITE_SUPABASE_URL=https://pjlilnigxhxqhfprsaiy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Environment

Add the same variables in:
Vercel Dashboard → Project → Settings → Environment Variables

---

## Migration History

### Original Platform: Base44

The application was originally built on Base44, a low-code platform. The migration to Supabase was performed to enable:

- Self-hosted deployment
- Custom authentication
- Direct database access
- Better performance
- No platform lock-in

### Migration Tasks Completed

1. **Database Schema**: Created PostgreSQL schema for all 7 entities
2. **Authentication**: Migrated from Base44 auth to Supabase Auth
3. **Data Layer**: Replaced Base44 SDK with Supabase client
4. **File Storage**: Migrated to Supabase Storage
5. **RLS Policies**: Implemented row-level security
6. **All Pages Updated**: 17+ pages migrated to new API

### Files Changed During Migration

- Created: `supabase/schema.sql`
- Created: `src/api/supabaseClient.js`
- Created: `src/api/auth.js`
- Created: `src/api/storage.js`
- Created: `src/api/services/baseService.js`
- Created: `src/contexts/AuthContext.jsx`
- Created: `src/pages/Login.jsx`
- Modified: All 17 page components
- Modified: `package.json` (replaced @base44/sdk with @supabase/supabase-js)

---

## Seed Data

### Test Users

| Email | Role | Name |
|-------|------|------|
| admin@simain.do | Administrador | Admin SIMAIN |
| gerente@simain.do | Gerente | Gerente SIMAIN |
| tecnico@simain.do | Técnico | Juan Técnico |
| tecnico1@simain.do | Técnico | Pedro Ramírez |
| tecnico2@simain.do | Técnico | Carlos Méndez |
| tecnico3@simain.do | Técnico | María García |
| tecnico4@simain.do | Técnico | Roberto Sánchez |

### Sample Data Includes

- **22 Work Orders**: Various statuses (Pendiente, Asignada, En Progreso, Completada)
- **17 Check-in Records**: GPS locations for live tracking
- **7 Work Reports**: Completed service reports
- **14 Certifications**: INDOCAL, ISO, NFPA, ODAC certifications
- **20+ Notifications**: System alerts and order updates

### Locations (Dominican Republic)

Work orders are distributed across:
- Santo Domingo (Centro, Este, Norte)
- Santiago de los Caballeros
- San Cristóbal (Haina, Nigua)
- Aeropuerto Las Américas

---

## Troubleshooting

### Common Issues

#### White Screen / Infinite Loading

**Cause**: Supabase free tier pauses after inactivity

**Solution**:
1. Wait 10-20 seconds for Supabase to wake up
2. Refresh the page
3. If persists, check browser console for errors

#### "Missing Supabase environment variables"

**Cause**: Environment variables not configured

**Solution**:
1. Verify `.env.local` exists with correct values
2. For Vercel: Add variables in project settings
3. Redeploy after adding variables

#### Login Spinning Forever

**Cause**: Auth request timeout or RLS policy issue

**Solution**:
1. Check Supabase dashboard → Authentication → Users
2. Verify user exists and is confirmed
3. Check `usuarios` table has matching profile

#### "Database error creating new user"

**Cause**: Trigger function failing

**Solution**: Run updated trigger function:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Recreate with SECURITY DEFINER (see schema.sql)
```

#### Orders Not Showing

**Cause**: RLS policies restricting access

**Solution**:
1. Verify user role in `usuarios` table
2. For technicians: check orders are assigned to their user_id
3. For managers: verify role is 'gerente' or 'administrador'

### Useful SQL Queries

```sql
-- Check user roles
SELECT email, rol FROM usuarios;

-- Count data by table
SELECT 'ordenes' as t, COUNT(*) FROM ordenes_trabajo
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios;

-- Check active technicians
SELECT u.nombre_completo, re.created_at, ot.numero_orden
FROM registros_entrada re
JOIN usuarios u ON re.usuario_id = u.id
JOIN ordenes_trabajo ot ON re.orden_trabajo_id = ot.id
WHERE re.tipo_registro = 'Inicio'
AND NOT EXISTS (
  SELECT 1 FROM registros_entrada re2
  WHERE re2.orden_trabajo_id = re.orden_trabajo_id
  AND re2.tipo_registro = 'Fin'
);
```

### Support Contacts

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **React**: https://react.dev

---

## Changelog

### v1.0.0 (December 2024)

- Initial release
- Migrated from Base44 to Supabase
- Deployed to Vercel
- 7 database tables with RLS
- 17 page components
- 3 user roles
- Real-time GPS tracking
- Photo upload support

---

*Documentation generated: December 29, 2024*
*SIMAIN SRL - Servicios de Ingeniería y Mantenimiento Industrial*
