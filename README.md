# PolyFlow

PolyFlow is a clean, modern PWA for managing 3D printing materials with an inline calculation workspace.

## Current status

- Version: `0.6.1`
- Phase 2.4 completed: material time-reference polish (minutes UI + selectable 45°/90°).
- Supabase-backed runtime is active for materials, shared options, and calculation records.
- Swedish UI, compact row overview, and GitHub Pages deployment workflow are active.

## What PolyFlow does in v1

- Browses and compares materials in a compact sortable overview.
- Uses one main search field for fast filtering.
- Expands one material inline to open a workspace directly under the row.
- Keeps key fixed material values visible in the compact overview rows.
- Manages multiple calculation scenarios per material (create, edit, remove).
- Calculates internal cost, sales price, batch totals, and lead time from fixed and entered values.
- Creates, edits, and deletes materials against Supabase.
- Loads kategori/tillverkare from shared Supabase option tables.
- Lets users add and inactivate kategori/tillverkare inline in create/edit forms.
- Prevents duplicate variants (for example `Sunlu`/`SUNLU`/`sunlu`) via canonical normalized keys.

## Product model in v1

PolyFlow separates three value types:

1. Fixed material values (persisted on `materials`)

- material name
- manufacturer reference (`manufacturer_id`)
- category reference (`category_id`)
- price per kg (EUR)
- max temperature (°C)
- time per layer reference time (stored as seconds)
- time per layer reference angle (`45°` or `90°`)
- notes

2. Shared option values (persisted globally)

- `material_manufacturers` (`label`, `normalized_key`, `is_active`)
- `material_categories` (`label`, `normalized_key`, `is_active`)

3. User-entered calculation values (persisted per scenario on `material_calculations`)

- kg material
- print time in hours
- quantity
- machine hourly rate (EUR)
- labor cost per part (EUR)
- post-process cost per part (EUR)
- setup time (hours)
- post-process time per part (hours)
- risk buffer (%)
- target margin (%)
- printer count
- optional calculation label

4. Calculated values (derived in UI)

- material cost per part (`price_per_kg_eur * kg_material`)
- internal cost per part
- suggested sales price per part
- batch internal cost, batch sales total, and contribution margin
- lead time and customer-facing summary values

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
5. `supabase/sql/005_materials_drop_legacy_option_checks.sql`
6. `supabase/sql/006_shared_material_options.sql`
7. `supabase/sql/007_material_calculations_sales_quote_fields.sql`
8. `supabase/sql/008_materials_reference_angle.sql`

If your project is already set up through `007`, run only:

- `supabase/sql/008_materials_reference_angle.sql`

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
- Read access for materials, shared options, and calculations is public via RLS policies.
- Write access (create/edit/delete/inactivate/create options) requires an authenticated session.

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
