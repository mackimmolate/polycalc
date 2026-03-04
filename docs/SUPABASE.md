# Supabase

## Current state

- Supabase is the active backend for PolyFlow Phase 2.1.
- Frontend client is defined in `src/lib/supabase/client.ts`.
- Runtime CRUD modules:
  - `src/services/materials/materialsService.ts`
  - `src/services/material-calculations/materialCalculationsService.ts`

## Environment variables

Required public client variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never use in frontend code:

- service-role keys

## SQL assets in repository

Apply in this order:

1. `supabase/sql/001_materials_schema.sql`
2. `supabase/sql/002_materials_rls.sql`
3. `supabase/sql/003_material_calculations.sql`

## Table model

### `public.materials` (fixed material values)

- `id` (`uuid`, PK)
- `name` (`text`, required)
- `manufacturer` (`text`, required, canonical check)
- `category` (`text`, required, canonical check)
- `price_per_kg_eur` (`numeric(10,2)`, required, `>= 0`)
- `max_temperature_c` (`integer`, nullable, `>= 0`)
- `time_per_layer_45_deg_seconds` (`integer`, required, `> 0`)
- `notes` (`text`, required, default `''`)
- `created_at`, `updated_at`

### `public.material_calculations` (entered scenario values)

- `id` (`uuid`, PK)
- `material_id` (`uuid`, FK -> `materials.id`, `on delete cascade`)
- `label` (`text`, default `''`)
- `kg_material` (`numeric(10,3)`, required, `>= 0`)
- `print_time_hours` (`numeric(10,2)`, required, `>= 0`)
- `created_at`, `updated_at`

Notes:

- Calculated output values (for example material cost) are derived in UI, not stored.
- One material can have many calculation records.

## RLS policy model (v1)

For both `materials` and `material_calculations`:

- Public read allowed (`select` policy).
- `insert`, `update`, `delete` allowed for `authenticated` role only.

This matches frontend behavior:

- unauthenticated users can browse/search/sort/read.
- authenticated users can create/edit/delete materials and calculations.

## Auth approach

- Sign-in method: magic link (`signInWithOtp`).
- Frontend route: `/auth`.
- Session is persisted client-side via Supabase JS auth config.

Required Supabase Auth URL setup:

- Local: `http://localhost:5173/`
- GitHub Pages: `https://<user>.github.io/<repo>/`

## Delete behavior

- Material destructive action is hard delete with double confirmation.
- Deleting a material cascades related calculations (`material_id` FK with cascade).
- Calculation rows can be removed individually.

## Deferred items

- Role-based authorization model.
- Manufacturer reference table and management UI.
- Offline mutation queue/sync.
