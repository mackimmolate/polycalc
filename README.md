# PolyFlow

PolyFlow is a clean, modern PWA for managing 3D printing materials with an inline calculation workspace.

## Current status

- Version: `0.4.0`
- Phase 2.1 completed: inline expandable material workflow with multiple calculations per material.
- Supabase-backed runtime is active for materials and calculation records.
- Swedish UI, compact row overview, and GitHub Pages deployment workflow are active.

## What PolyFlow does in v1

- Browses and compares materials in a compact sortable overview.
- Uses one main search field for fast filtering.
- Expands one material inline to open a workspace directly under the row.
- Shows fixed material/reference values in the expanded panel.
- Manages multiple calculation scenarios per material (create, edit, remove).
- Calculates material cost clearly from fixed and entered values.
- Creates, edits, and deletes materials against Supabase.
- Lets users add new manufacturer/category options directly from create/edit forms.

## Product model in v1

PolyFlow separates three value types:

1. Fixed material values (persisted on `materials`)

- material name
- manufacturer
- category
- price per kg (EUR)
- max temperature (°C)
- time per layer at 45° (seconds)
- notes

2. User-entered calculation values (persisted per scenario on `material_calculations`)

- kg material
- print time in hours
- optional calculation label

3. Calculated values (derived in UI)

- material cost in EUR (`price_per_kg_eur * kg_material`)

## Tech stack

- Vite
- React + TypeScript
- React Router (hash routing for GitHub Pages)
- Tailwind CSS
- Supabase JS
- `vite-plugin-pwa`
- ESLint + Prettier

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and set:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_BASE_PATH=/
```

### Database setup (manual)

Run SQL files in Supabase SQL editor, in order:

1. `supabase/sql/001_materials_schema.sql`
2. `supabase/sql/002_materials_rls.sql`
3. `supabase/sql/003_material_calculations.sql`
4. `supabase/sql/004_materials_custom_options.sql`

### Run

```bash
npm run dev
```

### Quality checks

```bash
npm run lint
npm run build
```

## Auth in v1

- Sign-in uses Supabase magic link (`/auth`).
- Read access for materials and calculations is public via RLS policies.
- Write access (create/edit/delete) requires an authenticated session.

## Deployment (GitHub Pages)

Workflow: `.github/workflows/deploy-pages.yml`

Required repository configuration:

1. `Settings -> Pages -> Source: GitHub Actions`
2. Add Actions variable `VITE_SUPABASE_URL`
3. Add Actions secret `VITE_SUPABASE_ANON_KEY`
4. In Supabase Auth URL configuration, allow redirect URL for your Pages site (`https://<user>.github.io/<repo>/`)

## PWA behavior in v1

- Install prompt is supported when browser conditions are met.
- Static shell/assets are cached.
- Offline CRUD and offline data sync are not implemented.

## Documentation map

- Repo guidance: [`AGENTS.md`](AGENTS.md)
- Version policy: [`VERSIONING.md`](VERSIONING.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Setup: [`docs/SETUP.md`](docs/SETUP.md)
- Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- Supabase: [`docs/SUPABASE.md`](docs/SUPABASE.md)
- Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
