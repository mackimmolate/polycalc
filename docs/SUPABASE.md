# Supabase

## Current state

- Phase 1 includes an isolated Supabase client scaffold at `src/lib/supabase/client.ts`.
- No business CRUD operations are wired to Supabase yet.

## Environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never use or expose:

- service-role keys in frontend code

Local setup:

- Copy `.env.example` to `.env.local`.
- Fill in Supabase URL and anon key.
- Keep `.env.local` uncommitted.

## v1 table direction

Primary table: `materials`

Suggested columns:

- `id` (`uuid`, primary key)
- `name` (`text`, required, unique as needed)
- `display_name` (`text`, required)
- `category` (`text`, required)
- `manufacturer` (`text`, nullable)
- `price_per_kg` (`numeric`, nullable)
- `max_temperature` (`integer`, nullable)
- `notes` (`text`, nullable)
- `status` (`text`, required, default `active`)
- `created_at` (`timestamptz`, default `now()`)
- `updated_at` (`timestamptz`, default `now()`)

## v1 security direction

- If auth is deferred, access policy and exposure must be intentional and documented before release.
- If auth is introduced, apply RLS and update policy documentation in this file.

## Deferred items

- Final SQL migration scripts.
- Final RLS policy design.
- Material CRUD integration from frontend services.
- Error handling and retry strategy for Supabase operations.
