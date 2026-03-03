# Setup

## Current state

- Phase 2 connected runtime is implemented.
- Materials data is loaded from Supabase.
- Create/edit/delete require authenticated session.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase Cloud project

## Environment variables

Create `.env.local` with:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_BASE_PATH=/
```

Rules:

- Never commit real secrets.
- Never use service-role keys in frontend code.
- `VITE_BASE_PATH` is optional for local work; default is `/`.

## Supabase manual setup

Run SQL files in Supabase SQL editor, in order:

1. `supabase/sql/001_materials_schema.sql`
2. `supabase/sql/002_materials_rls.sql`

Configure Supabase Auth URL settings:

- Site URL: your local URL for development (for example `http://localhost:5173/`)
- Additional redirect URLs:
  - `http://localhost:5173/`
  - your GitHub Pages URL (`https://<user>.github.io/<repo>/`)

## Local development flow

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Connected behavior checklist

- `/materials` loads data from Supabase.
- `/auth` signs in with magic link.
- Create/edit/delete are blocked when not signed in.
- Detail page calculator computes material cost from user-entered kg.
