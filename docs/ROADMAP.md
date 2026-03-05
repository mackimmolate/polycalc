# Roadmap

## Phase 0 (completed): Repository initialization

- Governance baseline (`AGENTS.md`)
- Documentation foundation
- Versioning and changelog baseline (`0.1.0`)

## Phase 1 (completed): Frontend foundation

- Vite + React + TypeScript scaffold
- Tailwind, ESLint, Prettier
- Routing, app shell, and PWA baseline
- GitHub Pages workflow baseline

## Phase 1.1-1.3 (completed): UX and model polish

- Swedish localization polish
- Compact row overview
- EUR formatting
- Search/findability refinements
- Single-name and canonical manufacturer direction

## Phase 2 (completed): Connected v1 baseline

- Supabase-backed list/detail/create/edit/delete
- Minimal auth (magic link) for write operations
- RLS baseline: public read + authenticated write
- Overview model finalized (search + sortable headers)
- Delete flow with double confirmation

## Phase 2.1 (completed): Inline expandable workspace and multi-calculation model

- Main workflow moved to expandable rows in `/materials`
- Inline fixed-value panel per material
- Multiple persisted calculations per material (`material_calculations`)
- Calculation CRUD directly in expanded row workspace
- Detail route reduced to compatibility redirect

## Phase 2.2 (completed): Shared canonical kategori/tillverkare in Supabase

- Added shared option entities (`material_categories`, `material_manufacturers`)
- Migrated `materials` to FK references (`category_id`, `manufacturer_id`)
- Replaced localStorage option source with Supabase-backed shared options in create/edit forms
- Added canonical duplicate prevention via normalized keys
- Added safe option removal via inactivation (`is_active = false`)

## Phase 2.3 (completed): Sales-oriented calculation workspace outputs

- Expanded per-material calculation model with persisted scenario inputs for quantity, cost drivers, margin target, and lead-time variables
- Added SQL upgrade asset `supabase/sql/007_material_calculations_sales_quote_fields.sql`
- Updated inline calculation workspace to show:
  - internkostnad/st
  - prisförslag/st
  - batchkostnad, offerttotal, täckningsbidrag
  - ledtid och kundsammanfattning
- Kept saved calculations read-only until explicit `Redigera`

## Phase 2.4 (completed): Material reference-time UX polish

- Replaced fixed `45°` wording in create/edit with selectable reference angle (`45°`/`90°`)
- Switched form input from seconds to minutes for easier entry
- Kept backend storage in seconds for precision
- Added schema support for `time_per_layer_reference_angle_deg`
- Updated material overview rendering to show minute-based time with angle context

## Phase 3 (next): Hardening and release readiness

- Add automated tests for critical flows (material + calculation services and key UI states)
- Improve error observability and user-facing diagnostics
- Optimize performance for larger material/calculation datasets
- Final production checklist before `1.0.0`

## Deferred scope (v1)

- Export functionality
- Advanced role/permission system
- Offline mutation queue and sync
- Full option administration workflow (rename/merge/bulk cleanup)
