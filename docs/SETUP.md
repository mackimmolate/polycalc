# Setup

## Current state

- Phase 2.4 sales-oriented calculation runtime is implemented.
- Materials, shared kategori/tillverkare options, and per-material calculations are loaded from Supabase.
- Material, calculation, and option mutations require authenticated session.

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
3. `supabase/sql/003_material_calculations.sql`
4. `supabase/sql/004_materials_custom_options.sql`
5. `supabase/sql/005_materials_drop_legacy_option_checks.sql`
6. `supabase/sql/006_shared_material_options.sql`
7. `supabase/sql/007_material_calculations_sales_quote_fields.sql`
8. `supabase/sql/008_materials_reference_angle.sql`

If your project is already initialized up to `007`, run only:

- `supabase/sql/008_materials_reference_angle.sql`

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

- `/materials` loads materials from Supabase.
- Expanding a material row loads related calculations from Supabase.
- Expanded calculations show sales-oriented outputs (internkostnad, prisförslag, batch, ledtid).
- `/auth` signs in with magic link.
- Write actions are blocked when not signed in.
- Material create/edit returns to overview and reopens target material inline.
- Material create/edit loads kategori/tillverkare from shared Supabase option tables.
- Material create/edit can add/inaktivera kategori/tillverkare directly from form controls.
- Material create/edit supports reference angle (`45°`/`90°`) and minute-based time input.
