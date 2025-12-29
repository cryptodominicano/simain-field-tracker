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

### Current Test (Dec 29, 2024)
**Observation**: Screenshot shows "Subiendo..." on BOTH the button AND below it - upload starts but hangs.

#### 5. Enhanced Logging (DEPLOYED)
Added detailed `[PHOTO]` and `[STORAGE]` prefixed console logs to trace exactly where hang occurs:
- `[PHOTO] File selected:` - file picked from gallery/camera
- `[PHOTO] Getting GPS location...` - starting GPS (now has 3s timeout)
- `[PHOTO] GPS obtained/skipped:` - GPS result
- `[PHOTO] Starting Supabase upload...` - calling storage API
- `[STORAGE] uploadFile called with:` - storage.js received call
- `[STORAGE] Getting current user...` - auth check
- `[STORAGE] Auth result:` - auth complete
- `[STORAGE] Starting upload to bucket:` - actual upload starting
- `[STORAGE] Upload promise created, waiting for result...` - waiting for Supabase
- `[STORAGE] Promise.race resolved` - upload completed OR timeout
- `[STORAGE] Upload result:` - success or error details
- `[PHOTO] Upload successful:` - back in UI code

#### GPS Fix Applied
- Reduced timeout from 5s to 3s with Promise.race backup
- Set `enableHighAccuracy: false` for faster mobile response
- Added `maximumAge: 60000` to accept cached location

### Next: Mobile Console Test
Need to check mobile browser console to see which log message is LAST before hang:
- If stuck at `[PHOTO] Getting GPS location...` → GPS issue (should be fixed now)
- If stuck at `[STORAGE] Getting current user...` → Auth deadlock (noOpLock issue)
- If stuck at `[STORAGE] Upload promise created...` → Supabase network/CORS issue
- If stuck at `[STORAGE] Promise.race resolved` → Upload succeeded but photo record failed

### How to Check Mobile Console
**Android**:
1. Enable USB debugging on phone
2. Connect to computer with USB
3. Open `chrome://inspect` in desktop Chrome
4. Find device and click "inspect"

**iOS**:
1. Connect iPhone to Mac with USB
2. Enable Web Inspector in Safari settings on phone
3. Open Safari on Mac → Develop menu → Select device

### Previous Console Messages (Old Format)
```
File selected: {name, type, size, lastModified}
File type empty, using: image/jpeg  (if type was missing)
Starting upload...
Starting upload to bucket: photos file: <path>
Upload result: {data, error}
Upload successful: <url>
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
