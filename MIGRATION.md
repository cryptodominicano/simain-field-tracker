# Base44 to Supabase Migration Guide

This document outlines the complete migration of SIMAIN Field Tracker from Base44 to Supabase.

## Overview

The migration replaces:
- **Base44 SDK** → **Supabase JS Client**
- **Base44 Auth** → **Supabase Auth**
- **Base44 Entities** → **Supabase PostgreSQL Tables**
- **Base44 File Storage** → **Supabase Storage**

## Migration Steps

### 1. Set Up Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key from Settings > API

### 2. Run Database Schema

Execute the SQL in `supabase/schema.sql` in your Supabase SQL Editor:

```sql
-- This creates:
-- - 7 tables (usuarios, ordenes_trabajo, registros_entrada, fotos, reportes_trabajo, certificaciones, notificaciones)
-- - All necessary indexes
-- - Row Level Security (RLS) policies
-- - Auto-create user profile trigger
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `photos`
3. Set it to public (or use signed URLs)
4. Add storage policies (examples in schema.sql comments)

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install Dependencies

```bash
npm install
# or
npm install @supabase/supabase-js
```

### 6. Create Initial Admin User

In Supabase Dashboard > Authentication > Users, create your first admin user. The trigger in the schema will auto-create their profile.

To set them as admin, run in SQL Editor:
```sql
UPDATE usuarios SET rol = 'administrador' WHERE email = 'admin@example.com';
```

## File Changes Summary

### New Files Created

| File | Purpose |
|------|---------|
| `src/api/supabaseClient.js` | Supabase client initialization |
| `src/api/auth.js` | Authentication service |
| `src/api/storage.js` | File upload service |
| `src/api/services/baseService.js` | Generic CRUD service factory |
| `src/api/services/index.js` | Entity service exports |
| `src/api/index.js` | Main API export |
| `src/contexts/AuthContext.jsx` | Auth context provider |
| `src/pages/Login.jsx` | Login page |
| `src/hooks/useUserProfile.js` | User profile hook |
| `supabase/schema.sql` | Complete database schema |
| `vercel.json` | Vercel deployment config |
| `.env.example` | Environment variable template |

### Files Modified

All page components updated to use new imports:

```javascript
// Before
import { base44 } from '@/api/base44Client';
base44.entities.usuarios.filter({...})
base44.auth.me()
base44.integrations.Core.UploadFile({...})

// After
import { entities, integrations } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
entities.usuarios.filter({...})
// Auth via useAuth() hook
integrations.Core.UploadFile({...})
```

## API Compatibility Layer

The new API maintains compatibility with Base44 patterns:

```javascript
// Entity operations (same interface)
entities.usuarios.list('-created_at', 100)
entities.usuarios.filter({ rol: 'tecnico', activo: true })
entities.usuarios.create({ nombre_completo: '...', ... })
entities.usuarios.update(id, { ... })
entities.usuarios.delete(id)

// File uploads (same interface)
const { file_url } = await integrations.Core.UploadFile({ file })

// Auth (via context)
const { user, userProfile, signOut } = useAuth()
```

## Database Schema

### Tables

1. **usuarios** - User profiles (linked to Supabase Auth)
2. **ordenes_trabajo** - Work orders
3. **registros_entrada** - Check-in/check-out logs
4. **fotos** - Photo attachments
5. **reportes_trabajo** - Work completion reports
6. **certificaciones** - Technician certifications
7. **notificaciones** - User notifications

### Field Name Changes

| Base44 | Supabase |
|--------|----------|
| `created_date` | `created_at` |
| `updated_date` | `updated_at` |
| `created_by` | `auth_id` (UUID reference) |

The service layer handles mapping automatically.

## Remaining Manual Updates

Some page files still need the import pattern updated. Search for:

```bash
grep -r "base44" src/pages/
```

And update any remaining files following the pattern above.

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Testing Checklist

- [ ] User can log in
- [ ] User can log out
- [ ] Dashboard loads correctly
- [ ] Work orders display
- [ ] Can create new work order
- [ ] Can assign technician
- [ ] Technician can start work (check-in)
- [ ] Technician can upload photos
- [ ] Technician can complete work (check-out)
- [ ] Reports generate correctly
- [ ] Certifications display
- [ ] Notifications work
- [ ] Profile update works
- [ ] Photo upload works

## Troubleshooting

### "Missing Supabase environment variables"
Ensure `.env.local` exists with correct values.

### "Row level security violation"
Check RLS policies in `supabase/schema.sql` and ensure user has correct role.

### "Auth error: Invalid login credentials"
Verify email is confirmed in Supabase Auth dashboard.

### "Storage upload failed"
Ensure the `photos` bucket exists and has correct policies.
