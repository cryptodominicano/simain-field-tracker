/**
 * Supabase API Layer
 * Drop-in replacement for Base44 SDK
 *
 * Usage:
 *   import { supabase, auth, entities, integrations } from '@/api';
 *
 * Or for Base44 compatibility:
 *   import supabase from '@/api';
 *   supabase.auth.me()
 *   supabase.entities.usuarios.list()
 *   supabase.integrations.Core.UploadFile({ file })
 */

import { supabase } from './supabaseClient';
import { auth } from './auth';
import { entities } from './services';
import { integrations, storage } from './storage';

// Default export matches Base44 client structure
const api = {
  supabase,
  auth,
  entities,
  integrations,
  storage
};

// Named exports
export { supabase } from './supabaseClient';
export { auth } from './auth';
export { entities } from './services';
export { integrations, storage } from './storage';
export * from './services';

export default api;
