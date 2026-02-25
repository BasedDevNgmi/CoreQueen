# CoreQueen

Pink & Badass fitness PWA: 3-day workout schedule, exercise checklists with confetti, and session logging to Supabase.

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4, Framer Motion, Lucide React, shadcn/ui
- Supabase (logs table, no auth)
- PWA (vite-plugin-pwa): Add to Home Screen, offline-ready

## Setup

1. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL editor, run the schema in `supabase/schema.sql`.
   - Copy `.env.example` to `.env` and set:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Build and preview**
   ```bash
   npm run build
   npm run preview
   ```

## PWA

Use “Add to Home Screen” on iOS/Android. Icons: `public/icon-192.png`, `public/icon-512.png`.

## Data

- **Dashboard**: 3-day schedule (Day A/B/C). Day A includes Suitcase Carry and Dead Bug.
- **Workout**: Check exercises; confetti on complete. “Log session” opens feeling + notes modal and writes to Supabase `logs` (no auth; `user_id` is fixed for now).
# CoreQueen
