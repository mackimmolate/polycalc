# PolyCalc

PolyCalc is a clean, modern PWA for managing 3D printing materials with an inline calculation workspace.

## Current status

- Version: `0.7.3`
- Current shipped state: capacity-aware självkostnadskalkyl with PDF export.
- Supabase-backed runtime is active for materials, shared options, and calculation records.
- Swedish UI, compact row overview, and GitHub Pages deployment workflow are active.

## What PolyCalc does in v1

- Browses and compares materials in a compact sortable overview.
- Uses one main search field for fast filtering.
- Expands one material inline to open a workspace directly under the row.
- Keeps key fixed material values visible in the compact overview rows.
- Manages multiple calculation scenarios per material (create, edit, remove).
- Calculates material cost, machine cost, internal cost, batch totals, and lead time from fixed and entered values.
- Supports capacity-aware scenarios with `antal detaljer/skrivare`.
- Exports saved calculations as branded PDF självkostnadskalkyler.
- Creates, edits, and deletes materials against Supabase.
- Loads kategori/tillverkare from shared Supabase option tables.
- Lets users add and inactivate kategori/tillverkare inline in create/edit forms.
- Prevents duplicate variants (for example `Sunlu`/`SUNLU`/`sunlu`) via canonical normalized keys.

## Product model in v1

PolyCalc separates three value types:

1. Fixed material values (persisted on `materials`)

- material name
- manufacturer reference (`manufacturer_id`)
- category reference (`category_id`)
- price per kg (EUR)
- max temperature (deg C)
- time per layer reference time (stored as seconds)
- time per layer reference angle (`45deg` or `90deg`)
- notes

2. Shared option values (persisted globally)

- `material_manufacturers` (`label`, `normalized_key`, `is_active`)
- `material_categories` (`label`, `normalized_key`, `is_active`)

3. Active user-entered calculation values (persisted per scenario on `material_calculations`)

- kg material
- print time per detail (entered in minutes, stored as hours)
- quantity
- details per printer
- machine hourly rate (EUR)
- setup time (entered in minutes, stored as hours)
- printer count
- optional calculation label

4. Calculated values (derived in UI)

- material cost per part (`price_per_kg_eur * kg_material`)
- machine cost per part
- internal cost per part
- batch internal cost
- lead time

Compatibility note:

- `material_calculations` still contains some legacy columns from the earlier sales-oriented iteration (`labor_cost_per_part_eur`, `post_process_cost_per_part_eur`, `post_process_time_hours_per_part`, `risk_buffer_percent`, `target_margin_percent`), but they are not part of the active UI or current calculation flow.

## Tech stack

- Vite
- React + TypeScript
- React Router (hash routing for GitHub Pages)
- Tailwind CSS
- Supabase JS
- `jsPDF`
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
9. `supabase/sql/009_material_calculations_details_per_printer.sql`

If your project is already set up through `008`, run only:

- `supabase/sql/009_material_calculations_details_per_printer.sql`

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

## Repository rename readiness

- Production Pages builds already derive `VITE_BASE_PATH` from the current GitHub repository name in CI.
- This means a future repository rename from `polyflow` to `polycalc` does not require a code change for asset paths or routing.
- After renaming the GitHub repository, update Supabase Auth settings to the new Pages URL:
  - `Site URL`: `https://<user>.github.io/<new-repo>/`
  - `Additional Redirect URLs`:
    - `https://<user>.github.io/<new-repo>/`
    - `https://<user>.github.io/<new-repo>/#/auth`
- Then redeploy from GitHub Actions so the new base path is baked into the build output.

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
