-- ============================================
-- CLIENT DATABASE RESET SCRIPT
-- Run this when setting up a new client
-- WARNING: This deletes ALL data!
-- ============================================

-- Step 1: Clear all operational data (order matters due to foreign keys)
TRUNCATE TABLE fotos CASCADE;
TRUNCATE TABLE registros_entrada CASCADE;
TRUNCATE TABLE reportes_trabajo CASCADE;
TRUNCATE TABLE notificaciones CASCADE;
TRUNCATE TABLE ordenes_trabajo CASCADE;
TRUNCATE TABLE certificaciones CASCADE;

-- Step 2: Clear users (except keeping the table structure)
DELETE FROM usuarios;

-- Step 3: Clear storage bucket
-- Run this in Supabase Dashboard > Storage > photos bucket > Delete all files

-- Step 4: Create initial admin user
-- Replace these values for the new client
INSERT INTO usuarios (
  id,
  email,
  nombre_completo,
  rol,
  activo,
  telefono
) VALUES (
  gen_random_uuid(),
  'admin@newclient.com',
  'Administrador',
  'administrador',
  true,
  '+1 000 000 0000'
);

-- Note: After running this script:
-- 1. Go to Supabase Auth and create the admin user with the same email
-- 2. Update src/config/branding.js with client information
-- 3. Test login and create additional users through the app
