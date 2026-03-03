# Setup

## Current state

- Phase 1 app foundation is implemented and runnable.
- Core material flows are scaffolded with preview data.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase Cloud project (for upcoming integration phases)

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

Notes:

- `VITE_BASE_PATH` is optional for local work; default is `/`.
- CI sets `VITE_BASE_PATH` automatically for GitHub Pages deploys.

## Local development flow

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Current behavior

- Material data is sourced from local preview fixtures in Phase 1.
- Supabase environment vars are scaffolded and ready, but CRUD wiring is deferred.
