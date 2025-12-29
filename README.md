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
Storage: "photos" bucket (public)

## Key Files
- src/api/supabaseClient.js - DB client
- src/api/storage.js - File uploads
- src/api/auth.js - Authentication
- src/contexts/AuthContext.jsx - Auth state
- src/pages/ - All 18 page components
- supabase/schema.sql - DB schema

## Current Task
[REPLACE WITH WHAT YOU'RE WORKING ON]

## Recent Changes
[UPDATE AFTER EACH SESSION]
- Added noOpLock fix for auth timeout
- Added storage upload error handling
- Added RLS policies for photos bucket

## Known Issues
[UPDATE AS NEEDED]
- Mobile photo uploads need testing