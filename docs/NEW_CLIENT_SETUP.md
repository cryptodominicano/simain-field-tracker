# New Client Setup Checklist

## Prerequisites
- [ ] Supabase project created
- [ ] Vercel account with deployment access
- [ ] Client branding assets (logo, colors)

## Database Setup
1. [ ] Run `supabase/schema.sql` in new Supabase project
2. [ ] Run `supabase/reset_client.sql` to create initial admin
3. [ ] Verify storage bucket "photos" exists and is public
4. [ ] Test RLS policies are working

## Configuration
1. [ ] Update `src/config/branding.js`:
   - Company name and contact info
   - Theme colors
   - Service types for their industry
   - Equipment categories
   - Feature flags as needed

2. [ ] Update environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Deployment
1. [ ] Create new Vercel project
2. [ ] Connect to Git repository (fork or branch)
3. [ ] Add environment variables in Vercel
4. [ ] Deploy and verify

## Testing
1. [ ] Admin login works
2. [ ] Can create technician users
3. [ ] Work orders can be created
4. [ ] Mobile photo upload works
5. [ ] Offline mode works
6. [ ] GPS tracking works

## Handoff
1. [ ] Train client admin on user management
2. [ ] Provide test credentials
3. [ ] Document any customizations made
