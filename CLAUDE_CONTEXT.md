# SIMAIN Field Tracker - Claude Code Context

## Quick Start
Repo: github.com/cryptodominicano/simain-field-tracker
Run locally: npm install && npm run dev
Live: https://simain-field-tracker.vercel.app

## Tech Stack
- Frontend: React 18 + Vite + TailwindCSS + Radix UI (shadcn)
- Backend: Supabase (pjlilnigxhxqhfprsaiy)
- Hosting: Vercel (auto-deploys on push to main)
- Language: Spanish UI, English code

## Database (Supabase)
Tables: usuarios, ordenes_trabajo, registros_entrada, fotos, reportes_trabajo, certificaciones, notificaciones
Roles: administrador, gerente, tecnico
Storage: "photos" bucket (public = true)

## Key Files
- src/api/supabaseClient.js - DB client with noOpLock fix
- src/api/storage.js - File uploads with timeout, error handling & offline queue
- src/api/auth.js - Authentication
- src/contexts/AuthContext.jsx - Auth state
- src/pages/DetalleOrden.jsx - Order detail with photo upload
- src/pages/Layout.jsx - Main layout component
- src/utils/offlineQueue.js - Offline photo queue (localStorage)
- src/hooks/useOfflineSync.js - Auto-sync when back online
- supabase/schema.sql - DB schema

## Current Task
None - ready for new work

## Mobile Photo Upload Issue - Debugging Log

### Status
- Desktop upload: WORKING
- Mobile upload: NOT WORKING (spinner hangs, no error shown)

### What We've Tried

#### 1. Storage Policies (DONE)
Verified and recreated RLS policies on storage.objects:
```sql
-- INSERT policy for authenticated users
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos');

-- UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'photos');

-- SELECT policy for public access
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'photos');
```

Verified bucket is public:
```sql
SELECT id, name, public FROM storage.buckets WHERE name = 'photos';
-- Result: photos | photos | true
```

#### 2. Auth Timeout Fix (DONE)
Added noOpLock to prevent browser lock deadlocks in supabaseClient.js:
```javascript
const noOpLock = async (name, acquireTimeout, fn) => {
  return await fn();
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lock: noOpLock
  }
});
```

#### 3. Storage Upload Error Handling (DONE)
Enhanced storage.js with:
- 60-second timeout for slow mobile connections
- 10MB max file size
- File type validation (JPG, PNG, GIF, WebP, HEIC, HEIF, PDF)
- Extension-based validation when MIME type is empty
- Detailed console logging for debugging
- User-friendly Spanish error messages for common errors (403, 404, 401, network, etc.)

#### 4. Mobile File Handling (DONE)
Updated DetalleOrden.jsx:
- Added detailed console.log for file selection debugging
- Handle empty file.type on mobile browsers by inferring from extension
- Added HEIC/HEIF support for iOS photos
- Split into two buttons: "Tomar Foto" (camera) and "Elegir de Galeria" (gallery)
- Reset file input after upload to allow re-selection

### Mobile Upload Issue - RESOLVED (Dec 29, 2024)

#### Root Cause Identified
Using on-screen debug status, we found the real errors:
- "La carga tardó demasiado" = **Timeout** (60s wasn't enough for 3MB+ files on LTE)
- "Error al subir archivo: Load failed" = **Network fetch failed** (connection dropped)

**Some uploads worked** - confirming auth and storage policies are correct. The issue was large file sizes (3-4MB) on unreliable mobile networks.

#### 6. Image Compression (DEPLOYED)
Added automatic compression for images >1MB:
- Uses Canvas API to resize/compress
- Max dimensions: 1920px on longest side
- JPEG quality: 80%
- Typical result: 3.11MB → ~0.85MB

#### 7. Retry Logic (DEPLOYED)
- 3 automatic retry attempts for failed uploads
- Delays: 1s after first fail, 2s after second
- Shows "Subiendo (intento 2/3)..." in status

#### 8. Increased Timeout (DEPLOYED)
- Timeout increased from 60s to 90s for slow networks

### Upload Flow (Current)
```
1. Archivo: image.jpg (3.11MB)
2. Comprimido: 3.11MB → 0.85MB
3. GPS OK / GPS omitido
4. Subiendo a Supabase... / Subiendo (intento 2/3)...
5. Guardando registro...
✓ ¡Completado!
```

## Recent Changes (Dec 2024)
- **Offline photo queue** - Photos saved to localStorage when no signal, auto-sync when back online, auto-refresh UI after sync
- Fixed DetalleOrden bottom padding (pb-56) so photos aren't hidden by action buttons
- Fixed auth initialization timeout with noOpLock
- Added robust file upload error handling with 60s timeout
- Added HEIC/HEIF support for iOS photos
- Split photo upload into Camera vs Gallery buttons
- Added detailed console logging for mobile debugging
- Fixed storage RLS policies
- Added mobile padding to technician layout (px-4)
- Created DOCUMENTATION.md (English technical docs)
- Created GUIA_RAPIDA.md (Spanish user guide)

## Test Accounts
- admin@simain.do (administrador)
- gerente@simain.do (gerente)
- tecnico@simain.do (tecnico) - use for mobile testing

## Known Issues
- Need to test HEIC conversion for non-Safari browsers

## Resolved Issues
- Mobile photo upload (Dec 29, 2024) - Fixed with image compression, retry logic, and 90s timeout
