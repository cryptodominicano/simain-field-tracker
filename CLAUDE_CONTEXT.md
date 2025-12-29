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
- src/api/storage.js - File uploads with timeout & error handling
- src/api/auth.js - Authentication
- src/contexts/AuthContext.jsx - Auth state
- src/pages/DetalleOrden.jsx - Order detail with photo upload
- src/pages/Layout.jsx - Main layout component
- supabase/schema.sql - DB schema

## Current Task
Debugging mobile photo upload issue - works on desktop, spins without error on mobile

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

### Next Steps to Debug
1. Test on mobile with browser dev tools connected:
   - iOS: Safari Web Inspector via Mac
   - Android: chrome://inspect on desktop Chrome

2. Check console logs on mobile for:
   - "File selected:" - confirms file was picked
   - "Starting upload..." - confirms upload began
   - Any error messages

3. If no console output after file selection:
   - The file input onChange may not be firing
   - Try different file input configurations

4. Possible remaining issues:
   - Mobile browser blocking cross-origin requests
   - File too large for mobile network
   - CORS issues with Supabase storage
   - Mobile Safari specific quirks

### Console Messages to Look For
```
File selected: {name, type, size, lastModified}
File type empty, using: image/jpeg  (if type was missing)
Starting upload...
Starting upload to bucket: photos file: <path>
Upload result: {data, error}
Upload successful: <url>
```

Or errors:
```
Upload race error: <error>
Supabase storage error: <error>
Photo upload error: <error>
Processing upload error: {message, statusCode, error}
```

## Recent Changes (Dec 2024)
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
- Mobile photo upload not working (debugging in progress)
- Need to test HEIC conversion for non-Safari browsers
