# Setup

## Current state

- Current shipped state is a capacity-aware calculation runtime with self-cost PDF export.
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
- GitHub Actions sets `VITE_BASE_PATH` automatically from the current repository name during Pages builds.

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
9. `supabase/sql/009_material_calculations_details_per_printer.sql`

Notes:

- Running all files in the listed order is safe for a fresh setup.
- `007_material_calculations_sales_quote_fields.sql` is mainly a historical compatibility upgrade for older databases. A fresh setup from the current `003_material_calculations.sql` already includes those legacy compatibility columns.

If your project is already initialized up to `008`, run only:

- `supabase/sql/009_material_calculations_details_per_printer.sql`

Configure Supabase Auth URL settings:

- Site URL: your local URL for development (for example `http://localhost:5173/`)
- Additional redirect URLs:
  - `http://localhost:5173/`
  - your GitHub Pages URL (`https://<user>.github.io/<repo>/`)

If you rename the GitHub repository later, update the Pages URL in both `Site URL` and `Additional redirect URLs` to match the new repository name before testing magic-link login on Pages.

## Local development flow

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

Full local verification:

```bash
npm run verify
```

## Connected behavior checklist

- `/materials` loads materials from Supabase.
- Expanding a material row loads related calculations from Supabase.
- Expanded calculations show self-cost outputs (materialkostnad, maskinkostnad, internkostnad, batch, ledtid).
- Expanded calculations support `antal detaljer/skrivare` for capacity-aware cost/tid.
- Saved calculations can export branded PDF självkostnadskalkyler.
- `/auth` signs in with magic link.
- Write actions are blocked when not signed in.
- Material create/edit returns to overview and reopens target material inline.
- Material create/edit loads kategori/tillverkare from shared Supabase option tables.
- Material create/edit can add/inaktivera kategori/tillverkare directly from form controls.
- Material create/edit supports reference angle (`45°`/`90°`) and minute-based time input.
- Legacy sales-oriented calculation columns remain in the DB schema from earlier iterations, but the active frontend no longer reads or writes them.
