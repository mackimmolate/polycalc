# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.4.0] - 2026-03-04

### Added

- Inline expandable material workspace directly in overview rows.
- Multi-calculation support per material with Supabase-backed CRUD.
- New Supabase schema asset for calculation records:
  - `supabase/sql/003_material_calculations.sql`
- Dedicated calculation service module:
  - `src/services/material-calculations/materialCalculationsService.ts`
- Expanded material panel with fixed reference values plus calculation workspace.

### Changed

- Overview workflow is now primary; separate detail page is no longer the primary interaction path.
- Material rows now include inline expand/collapse controls and fixed-value summary fields including time-per-layer.
- Create/edit material flows now return users to overview and reopen the affected material inline.
- Sorting supports `timePerLayer45DegSeconds` in addition to existing sortable fields.
- Supabase database typings now include `material_calculations` relation.

### Deferred

- Export functionality.
- Advanced role/permission model beyond authenticated writes.
- Offline data mutations and offline sync.

## [0.3.0] - 2026-03-03

### Added

- Supabase-backed material runtime with real list/detail/create/update/delete flows.
- Minimal auth flow with Supabase magic link (`/auth`) and session-aware UI in app shell.
- SQL assets for manual Supabase setup:
  - `supabase/sql/001_materials_schema.sql`
  - `supabase/sql/002_materials_rls.sql`
- Calculation-aware material detail section with clear split between:
  - fixed values
  - user-entered values (`kg material`, `print time in hours`)
  - calculated output (`material cost in EUR`)
- Auth-required guard state for write actions.

### Changed

- Overview interaction model finalized to one visible control (`search`) plus sortable column headers.
- Removed overview dropdown controls for category, manufacturer, and sort.
- Expanded practical content width and increased notes room in compact rows.
- Replaced archive direction with delete direction and implemented a real double-confirm delete flow.
- Replaced preview runtime data with connected Supabase service calls.
- Forms now persist real data with validation for the refined v1 model:
  - single `name` field
  - canonical manufacturer selection
  - EUR pricing
  - normalized `time_per_layer_45_deg_seconds`
- GitHub Pages workflow now validates Supabase build variables and injects URL/key during build.

### Removed

- Local preview-data runtime dependency for materials pages.
- Unused status badge component from the pre-connected model.

### Deferred

- Export functionality.
- Advanced role/permission model beyond authenticated writes.
- Offline data mutations and offline sync for Supabase data.

## [0.2.3] - 2026-03-03

### Changed

- Replaced the oversized overview cards with a compact row-based material list optimized for fast side-by-side comparison.
- Kept key fields visible per row (materialnamn, tillverkare, kategori, pris per kg, maxtemperatur, anteckning).
- Switched visible price formatting from USD to EUR using Swedish locale formatting.
- Improved findability in overview by strengthening search matching and adding manufacturer filter plus refined sort options.

### Deferred

- Supabase CRUD and auth remain deferred to Phase 2.

## [0.2.2] - 2026-03-03

### Changed

- Removed visible `status` filtering from the materials overview and removed visible `updated`/`status` columns from overview presentation.
- Reworked the materials overview into scan-friendly labeled cards showing key information directly (name, manufacturer, category, price, max temperature, notes).
- Refined the active v1 material model to use one `name` field only (removed dual-name `displayName` usage from types, preview data, forms, and UI).
- Replaced free-text manufacturer input in create/edit scaffolds with a centralized canonical option list for consistent values.
- Aligned preview data and filtering/sorting utilities with the refined v1 model and Swedish UI direction.

### Deferred

- Supabase CRUD and auth remain deferred to Phase 2.

## [0.2.1] - 2026-03-03

### Changed

- Removed duplicate in-page "Add Material" CTA from the materials page heading.
- Localized visible app UI copy to Swedish across navigation, pages, controls, messages, and PWA install text.
- Improved materials list/table column alignment for clearer header-to-row scanning.
- Removed visible filter labels for search/status/category/sort and preserved accessibility with screen-reader labels and `aria-label`s.
- Localized preview material notes and formatting output (`sv-SE` date/currency presentation with USD values).

### Deferred

- Supabase CRUD and persistence remain deferred to Phase 2.

## [0.2.0] - 2026-03-03

### Added

- Production-minded frontend scaffold with Vite + React + TypeScript.
- Tailwind CSS v4 setup and a polished responsive app shell.
- React Router foundation with real routes for:
  - materials list
  - material detail
  - create material
  - edit material
  - not found
- Feature-oriented `src/` architecture (`app`, `components`, `features`, `pages`, `services`, `api`, `types`, `utils`, `styles`, `lib`).
- PWA baseline with manifest, service worker registration, install prompt hook, and placeholder icons.
- GitHub Pages deployment workflow at `.github/workflows/deploy-pages.yml` with install, lint, build, upload, and deploy steps.
- Environment strategy via `.env.example` and isolated Supabase client scaffold (`src/lib/supabase/client.ts`).
- Prettier configuration and formatting scripts.

### Changed

- Package metadata updated to `polyflow@0.2.0`.
- Vite configuration now handles GitHub Pages base paths and PWA plugin setup.
- Documentation updated to reflect implemented Phase 1 behavior and deployment steps.

### Deferred

- Supabase CRUD integration and persistence.
- Archive/delete execution logic.
- Advanced offline sync and offline-first data mutations.

## [0.1.0] - 2026-03-03

### Added

- Repository governance baseline via `AGENTS.md`.
- Full initial documentation set:
  - `README.md`
  - `VERSIONING.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SETUP.md`
  - `docs/DEPLOYMENT.md`
  - `docs/SUPABASE.md`
  - `docs/DECISIONS.md`
  - `docs/ROADMAP.md`
- Initial product, architecture, and delivery constraints documented for phased execution.

### Deferred

- Frontend application scaffold (Vite + React + TypeScript).
- CI/CD workflow implementation.
- Supabase runtime integration and schema deployment.
- PWA runtime configuration and assets.
