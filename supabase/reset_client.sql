-- ============================================
-- RESET DATABASE FOR NEW CLIENT
-- ============================================
--
-- ⚠️  WARNING: This script DELETES ALL DATA!
-- Only run this when setting up for a NEW client.
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run"
-- 4. Verify tables are empty
--
-- ============================================

-- Step 1: Delete all data (order matters due to foreign keys)
-- ============================================

-- Delete dependent tables first
DELETE FROM notificaciones;
DELETE FROM fotos;
DELETE FROM reportes_trabajo;
DELETE FROM registros_entrada;
DELETE FROM certificaciones;

-- Delete main tables
DELETE FROM ordenes_trabajo;
DELETE FROM usuarios;

-- Delete auth users (this removes login accounts)
DELETE FROM auth.users;

-- Step 2: Reset auto-increment sequences (optional)
-- ============================================

-- If you want IDs to start from 1 again, uncomment these:
-- ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE ordenes_trabajo_id_seq RESTART WITH 1;
-- ALTER SEQUENCE registros_entrada_id_seq RESTART WITH 1;
-- ALTER SEQUENCE fotos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE reportes_trabajo_id_seq RESTART WITH 1;
-- ALTER SEQUENCE certificaciones_id_seq RESTART WITH 1;
-- ALTER SEQUENCE notificaciones_id_seq RESTART WITH 1;

-- Step 3: Clear storage bucket (run separately if needed)
-- ============================================
-- Note: To delete all photos from storage, go to:
-- Supabase Dashboard → Storage → photos bucket → Select All → Delete
-- Or use the Supabase API/CLI

-- Step 4: Verify reset
-- ============================================

SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'ordenes_trabajo', COUNT(*) FROM ordenes_trabajo
UNION ALL
SELECT 'registros_entrada', COUNT(*) FROM registros_entrada
UNION ALL
SELECT 'fotos', COUNT(*) FROM fotos
UNION ALL
SELECT 'reportes_trabajo', COUNT(*) FROM reportes_trabajo
UNION ALL
SELECT 'certificaciones', COUNT(*) FROM certificaciones
UNION ALL
SELECT 'notificaciones', COUNT(*) FROM notificaciones;

-- All counts should be 0

-- ============================================
-- NEXT STEPS AFTER RESET:
-- ============================================
-- 1. Create new admin user for the client
-- 2. Update src/config/branding.js with client info
-- 3. Upload client logo to /public folder
-- 4. Deploy to Vercel
-- 5. Share login credentials with client
-- ============================================
