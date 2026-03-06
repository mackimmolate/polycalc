# Supabase

## Current state

- Supabase is the active backend for the current PolyCalc självkostnadskalkyl workflow.
- Frontend client is defined in `src/lib/supabase/client.ts`.
- Runtime CRUD modules:
  - `src/services/materials/materialsService.ts`
  - `src/services/material-options/materialOptionsService.ts`
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
4. `supabase/sql/004_materials_custom_options.sql`
5. `supabase/sql/005_materials_drop_legacy_option_checks.sql`
6. `supabase/sql/006_shared_material_options.sql`
7. `supabase/sql/007_material_calculations_sales_quote_fields.sql`
8. `supabase/sql/008_materials_reference_angle.sql`
9. `supabase/sql/009_material_calculations_details_per_printer.sql`

Upgrade note:

- If your database already has scripts `001`-`008`, run only `009` to add calculation capacity support (`details_per_printer`).

## Table model

### `public.material_categories` (shared category options)

- `id` (`uuid`, PK)
- `label` (`text`, required)
- `normalized_key` (`text`, required, unique)
- `is_active` (`boolean`, required, default `true`)
- `created_at`, `updated_at`

### `public.material_manufacturers` (shared manufacturer options)

- `id` (`uuid`, PK)
- `label` (`text`, required)
- `normalized_key` (`text`, required, unique)
- `is_active` (`boolean`, required, default `true`)
- `created_at`, `updated_at`

### `public.materials` (fixed material values + option references)

- `id` (`uuid`, PK)
- `name` (`text`, required)
- `manufacturer_id` (`uuid`, FK -> `material_manufacturers.id`, required)
- `category_id` (`uuid`, FK -> `material_categories.id`, required)
- `price_per_kg_eur` (`numeric(10,2)`, required, `>= 0`)
- `max_temperature_c` (`integer`, nullable, `>= 0`)
- `time_per_layer_45_deg_seconds` (`integer`, required, `> 0`)
- `time_per_layer_reference_angle_deg` (`integer`, required, `45` or `90`)
- `notes` (`text`, required, default `''`)
- `created_at`, `updated_at`

### `public.material_calculations` (scenario values)

- `id` (`uuid`, PK)
- `material_id` (`uuid`, FK -> `materials.id`, `on delete cascade`)
- `label` (`text`, default `''`)
- `kg_material` (`numeric(10,3)`, required, `>= 0`)
- `print_time_hours` (`numeric(10,2)`, required, `>= 0`)
- `quantity` (`integer`, required, `> 0`)
- `details_per_printer` (`integer`, required, `> 0`)
- `machine_hourly_rate_eur` (`numeric(10,2)`, required, `>= 0`)
- `setup_time_hours` (`numeric(10,2)`, required, `>= 0`)
- `printer_count` (`integer`, required, `> 0`)
- `created_at`, `updated_at`

Legacy compatibility columns retained in schema:

- `labor_cost_per_part_eur` (`numeric(10,2)`, required, `>= 0`)
- `post_process_cost_per_part_eur` (`numeric(10,2)`, required, `>= 0`)
- `post_process_time_hours_per_part` (`numeric(10,2)`, required, `>= 0`)
- `risk_buffer_percent` (`numeric(5,2)`, required, `0..100`)
- `target_margin_percent` (`numeric(5,2)`, required, `0..99.99`)

Notes:

- Calculated output values are derived in UI, not stored (materialkostnad, maskinkostnad, internkostnad, batchsummering och ledtid).
- `details_per_printer` enables capacity-aware cost and lead-time calculations when multiple details can be produced per printer run.
- Material per-layer reference time is shown as minutes in UI, but stored as seconds in DB.
- One material can have many calculation records.
- Category and manufacturer values are now canonical shared entities with normalized keys.
- Duplicate variants are prevented by `normalized_key` uniqueness.
- Removing an option from the form inactivates it (`is_active = false`) instead of hard delete.
- Legacy sales-oriented columns remain for schema compatibility but are not part of the current UI/runtime, and the active frontend service layer no longer reads or writes them.

## RLS policy model (v1)

For `materials`, `material_calculations`, `material_categories`, and `material_manufacturers`:

- Public read allowed (`select` policy).
- `insert`/`update` allowed for `authenticated` role.
- `delete` allowed for `authenticated` only on runtime entities that use hard delete (`materials`, `material_calculations`).
- Option tables intentionally use update-only removal behavior (inactivation), so delete grants/policies are not provided.

This matches frontend behavior:

- unauthenticated users can browse/search/sort/read.
- authenticated users can create/edit/delete materials and calculations.
- authenticated users can add and inactivate shared category/manufacturer options.

## Auth approach

- Sign-in method: magic link (`signInWithOtp`).
- Frontend route: `/auth`.
- Session is persisted client-side via Supabase JS auth config.

Required Supabase Auth URL setup:

- Local: `http://localhost:5173/`
- GitHub Pages: `https://<user>.github.io/<repo>/`

If the GitHub repository name changes, update Supabase Auth configuration to the new Pages URL in both:

- `Site URL`
- `Additional Redirect URLs`

Recommended Pages entries after rename:

- `https://<user>.github.io/<new-repo>/`
- `https://<user>.github.io/<new-repo>/#/auth`

## Delete behavior

- Material destructive action is hard delete with double confirmation.
- Deleting a material cascades related calculations (`material_id` FK with cascade).
- Calculation rows can be removed individually.
- Category/manufacturer option removal uses soft deactivation (`is_active = false`) to protect existing material references.

## Deferred items

- Role-based authorization model.
- Option rename/admin moderation workflow beyond inline add/inactivate.
- Offline mutation queue/sync.
