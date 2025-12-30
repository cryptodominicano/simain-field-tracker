# New Client Setup Checklist

## Overview
This guide walks through setting up Field Service Tracker for a new client. Time estimate: 30-60 minutes.

---

## Option A: Clone for New Client (Recommended)

Use this if you want to keep SIMAIN separate and create a fresh instance.

### 1. Clone Repository
```bash
git clone https://github.com/cryptodominicano/simain-field-tracker.git new-client-field-tracker
cd new-client-field-tracker
rm -rf .git
git init
git remote add origin https://github.com/YOUR_USERNAME/new-client-field-tracker.git
```

### 2. Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it: `newclient-field-tracker`
4. Choose region closest to client
5. Save the project URL and anon key

### 3. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/schema.sql`
3. Paste and run the entire script
4. Verify 7 tables created

### 4. Create Storage Bucket
1. Go to Storage → New Bucket
2. Name: `photos`
3. Public: Yes
4. Run RLS policies from `supabase/schema.sql` (storage section)

### 5. Update Environment
Create `.env.local`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Update Branding
Edit `src/config/branding.js`:
- companyName
- appName
- logo
- colors
- serviceTypes (if different industry)
- certificationTypes (if different industry)
- map.defaultCenter (client's city)

### 7. Deploy to Vercel
```bash
vercel
# Follow prompts, add environment variables
```

### 8. Create Admin User
1. Go to Supabase → Authentication → Users
2. Click "Add User"
3. Email: admin@newclient.com
4. Password: (generate secure password)
5. The trigger will auto-create the usuarios record

### 9. Handoff to Client
- [ ] Send login URL
- [ ] Send admin credentials
- [ ] Send user guide (Guia_Usuario.docx)
- [ ] Schedule training call

---

## Option B: Reset Existing Project

Use this only if reusing the same Supabase/Vercel project.

### 1. Reset Database
1. Go to Supabase → SQL Editor
2. Run `supabase/reset_client.sql`
3. Verify all tables show 0 records

### 2. Clear Storage
1. Go to Storage → photos bucket
2. Select all files
3. Delete

### 3. Update Branding
Edit `src/config/branding.js` with new client info

### 4. Create New Admin
Same as Option A, Step 8

### 5. Deploy
```bash
git add .
git commit -m "Setup for [New Client Name]"
git push
```
Vercel auto-deploys.

---

## Client Information Needed

Collect this before setup:

| Item | Example | Got it? |
|------|---------|---------|
| Company name | "ABC Services SRL" | ☐ |
| Logo file (PNG, 200x50px) | abc-logo.png | ☐ |
| Primary color (hex) | #1E3A5F | ☐ |
| Admin email | admin@abcservices.com | ☐ |
| Service types | Installation, Repair, Maintenance | ☐ |
| Certification types | NFPA, OSHA, State License | ☐ |
| Default map location | City, Country | ☐ |
| Support email | support@abcservices.com | ☐ |

---

## Pricing Reminder

| Tier | Monthly | Features |
|------|---------|----------|
| Starter | $297 | Up to 5 users, email support |
| Professional | $497 | Up to 25 users, priority support |
| Enterprise | $797+ | Unlimited users, custom features |

Your costs: ~$0-25/mo (Supabase free tier + Vercel free)

---

## Post-Setup Tasks

- [ ] Test login as admin
- [ ] Create test work order
- [ ] Test photo upload (online)
- [ ] Test offline photo queue
- [ ] Test mobile responsiveness
- [ ] Send invoice to client
- [ ] Schedule 30-day check-in

---

## Troubleshooting

**White screen on load?**
- Check Supabase URL and anon key in Vercel env vars
- noOpLock fix should already be in supabaseClient.js

**Photos not uploading?**
- Verify storage bucket is public
- Check RLS policies are applied
- Test on WiFi first

**Auth not working?**
- Verify auth.users trigger exists
- Check usuarios table has matching auth_id

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/config/branding.js` | All customizable settings |
| `supabase/schema.sql` | Database structure |
| `supabase/reset_client.sql` | Wipe data for new client |
| `templates/Guia_Usuario.docx` | User guide template |
