# Supabase

## Current state

- Supabase is the active backend for PolyFlow Phase 2.
- Frontend client is defined in `src/lib/supabase/client.ts`.
- Runtime CRUD is implemented in `src/services/materials/materialsService.ts`.

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

## v1 table model

Table: `public.materials`

Columns:

- `id` (`uuid`, PK, default `gen_random_uuid()`)
- `name` (`text`, required)
- `manufacturer` (`text`, required, canonical check constraint)
- `category` (`text`, required, canonical check constraint)
- `price_per_kg_eur` (`numeric(10,2)`, required, `>= 0`)
- `max_temperature_c` (`integer`, nullable, `>= 0`)
- `time_per_layer_45_deg_seconds` (`integer`, required, `> 0`)
- `notes` (`text`, required, default `''`)
- `created_at` (`timestamptz`, default UTC now)
- `updated_at` (`timestamptz`, default UTC now, auto-updated by trigger)

Notes:

- v1 uses one material name field (`name`), no dual-name model.
- Calculator input values are user-entered in UI and not persisted.

## RLS policy model (v1)

- RLS enabled on `public.materials`.
- Public read allowed (`select` policy).
- `insert`, `update`, `delete` allowed for `authenticated` role only.

This matches frontend behavior:

- unauthenticated users can browse/search/sort/read.
- authenticated users can create/edit/delete.

## Auth approach

- Sign-in method: magic link (`signInWithOtp`).
- Frontend route: `/auth`.
- Session is persisted client-side via Supabase JS auth config.

Required Supabase Auth URL setup:

- Local: `http://localhost:5173/`
- GitHub Pages: `https://<user>.github.io/<repo>/`

## Delete behavior

- v1 destructive action is hard delete.
- Archive behavior is intentionally deferred.
- UI enforces double confirmation before delete request.

## Deferred items

- Role-based authorization model.
- Manufacturer reference table and management UI.
- Offline mutation queue/sync.
