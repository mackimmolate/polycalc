# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.7.5] - 2026-03-06

### Added

- Additional automated tests for:
  - auth callback parsing used by the magic-link flow
  - materials overview search/sort behavior
- `npm run verify` script for local release-readiness validation.
- CI test step in the GitHub Pages deployment workflow.

### Changed

- Upgraded `jspdf` from `2.5.2` to `4.2.0`, removing the previous critical audit finding in the PDF export dependency chain.
- Extracted auth callback parsing into a dedicated utility module to make the magic-link callback handling directly testable.

### Documentation

- Documented the current release-readiness baseline and the remaining unresolved PWA/workbox audit chain.

## [0.7.4] - 2026-03-06

### Added

- Minimal automated test baseline with `vitest` and focused unit tests for the calculation engine.
- Retry actions for runtime read failures in the materials overview and inline calculation workspace.

### Changed

- Extracted calculation formulas into a dedicated reusable utility module instead of keeping the logic embedded in the workspace component.
- Simplified the active `material_calculations` runtime model to the fields PolyCalc actually uses:
  - `label`
  - `kg_material`
  - `print_time_hours`
  - `quantity`
  - `details_per_printer`
  - `machine_hourly_rate_eur`
  - `setup_time_hours`
  - `printer_count`
- Stopped active runtime reads/writes for the legacy sales-oriented calculation columns while keeping them untouched in the database for schema compatibility.
- Consolidated duplicated Supabase session/error helpers into shared service utilities.
- Renamed the PDF export utility from quote-oriented naming to self-cost-oriented naming in code.

### Removed

- Unused `src/api/contracts.ts`.

### Documentation

- Updated docs to reflect the new stabilization baseline, automated test command, and the fact that legacy sales-oriented calculation columns remain schema-only compatibility fields.

## [0.7.3] - 2026-03-06

### Changed

- Clarified and hardened the GitHub Pages deployment foundation for future repository rename from `polyflow` to `polycalc`.
- Kept Pages base-path handling repository-name-aware in CI so production builds follow the current GitHub repository name automatically.
- Renamed the deployment workflow label from `Deploy PolyFlow` to `Deploy PolyCalc`.

### Documentation

- Documented the exact manual Supabase Auth URL updates required after a GitHub repository rename.
- Clarified that `VITE_BASE_PATH` remains optional locally and is derived automatically in GitHub Actions builds.

## [0.7.2] - 2026-03-06

### Changed

- Renamed the product from `PolyFlow` to `PolyCalc` across the app shell, PWA identity, metadata, exported PDF branding, and package metadata.
- Updated the visible monogram from `PF` to `PC`.

### Documentation

- Renamed the product consistently across repo documentation, governance guidance, and versioning records.

## [0.7.1] - 2026-03-06

### Changed

- Reframed the active calculation flow from sales/quote language to self-cost language:
  - removed visible `Försäljningspris` and `Totalt kundpris`
  - PDF export now produces a `Självkostnadskalkyl` instead of an offert
- Updated the exported PDF to:
  - include material max temperature
  - show calculation label before material name in the header
  - keep the exported document focused on internal cost only

### Documentation

- Aligned README, setup, architecture, Supabase, roadmap, and decision records with the current självkostnadskalkyl workflow.
- Documented that several sales-oriented columns still exist in `material_calculations` for schema compatibility, but are not part of the active UI/runtime.

## [0.7.0] - 2026-03-05

### Added

- Capacity-aware calculation input persisted on `material_calculations`:
  - `details_per_printer` (`antal detaljer/skrivare`)
- New Supabase SQL upgrade asset:
  - `supabase/sql/009_material_calculations_details_per_printer.sql`
- PDF export for saved calculations:
  - `Exportera PDF` action in read-only kalkyl view
  - branded offert layout using project logo

### Changed

- Refined calculation workspace inputs and labels:
  - `Kg material` -> `Kg/detalj`
  - `Antal` -> `Antal detaljer`
  - `Antal detaljer/skrivare` moved into `Kapacitet och tid`
- Updated machine cost and lead-time logic to include printer capacity:
  - machine cost per detail now accounts for details per printer
  - lead time now uses total parallel capacity (`antal skrivare * antal detaljer/skrivare`)
- Moved `marstromlogo.png` from repo root to:
  - `src/assets/brand/marstromlogo.png`

## [0.6.1] - 2026-03-05

### Added

- New materials schema upgrade asset:
  - `supabase/sql/008_materials_reference_angle.sql`
- Added Supabase-backed reference-angle field on materials:
  - `time_per_layer_reference_angle_deg` (45 or 90)

### Changed

- Refactored material create/edit field from fixed `45°` + seconds input to:
  - selectable reference angle (`45°` or `90°`)
  - input in minutes (UI)
- Kept internal storage in seconds for precision and compatibility.
- Updated materials overview display to show reference time in minutes with angle (for example `1,25 min @ 90°`).
- Updated sorting/search to use the new generic per-layer reference-time model.

## [0.6.0] - 2026-03-04

### Added

- Sales-oriented calculation inputs persisted on `material_calculations`:
  - `quantity`
  - `machine_hourly_rate_eur`
  - `labor_cost_per_part_eur`
  - `post_process_cost_per_part_eur`
  - `setup_time_hours`
  - `post_process_time_hours_per_part`
  - `risk_buffer_percent`
  - `target_margin_percent`
  - `printer_count`
- New Supabase SQL upgrade asset:
  - `supabase/sql/007_material_calculations_sales_quote_fields.sql`

### Changed

- Refactored inline calculation workspace UI to highlight sales-friendly outputs per saved calculation:
  - internkostnad/st
  - prisförslag/st
  - batchkostnad, offerttotal, täckningsbidrag
  - ledtid och kundsammanfattning
- Kept saved calculations in read-only presentation mode until explicit `Redigera`.
- Updated calculation service/types/Supabase DB typings for the expanded persisted scenario-input model.
- Updated setup and Supabase docs with new SQL order and `007` upgrade path.

## [0.5.0] - 2026-03-04

### Added

- New shared Supabase option tables and migration asset:
  - `supabase/sql/006_shared_material_options.sql`
- New shared option service module:
  - `src/services/material-options/materialOptionsService.ts`
- New option domain type:
  - `src/types/materialOption.ts`

### Changed

- Replaced localStorage-based category/manufacturer source model with Supabase-backed shared options.
- Refactored `materials` runtime model to foreign-key references:
  - `materials.category_id -> material_categories.id`
  - `materials.manufacturer_id -> material_manufacturers.id`
- Updated create/edit forms to:
  - load category/manufacturer options from Supabase
  - support inline add with canonical duplicate handling
  - support safe remove via option inactivation (`is_active = false`)
  - show loading/error states for shared option reads and mutations
- Updated Supabase typings for new tables and materials FK columns.
- Updated legacy SQL scripts (`004`, `005`) to be safer when text columns are no longer present.

### Removed

- Browser-local option preference utility from active runtime (`src/features/materials/utils/materialOptionPreferences.ts`).
- Static manufacturer option file (`src/types/manufacturer.ts`).

## [0.4.3] - 2026-03-04

### Changed

- `Ta bort kategori` and `Ta bort tillverkare` are now available for all current dropdown options, not only custom-added values.
- Removed options are now hidden from form dropdowns on the same device/browser via persisted preference state.
- Updated remove action labels to `- Ta bort kategori` and `- Ta bort tillverkare`.

## [0.4.2] - 2026-03-04

### Added

- Added persistent custom option storage for category and manufacturer in create/edit forms (`localStorage`) so user-added values are available in later forms.
- Added `Ta bort kategori` and `Ta bort tillverkare` actions next to the existing add actions in forms.

### Changed

- Updated create/edit option management flow so category/manufacturer custom values can be added and removed without leaving the form.

## [0.4.1] - 2026-03-04

### Changed

- Made material rows fully clickable with clearer inline expand/collapse affordance (removed separate row action button/column).
- Added saved/read-only calculation mode after save; calculations now require explicit `Redigera` to become editable again.
- Removed `Övrigt` from default category options in create/edit form.

### Added

- New SQL compatibility hotfix to remove legacy fixed-list constraints for manufacturer/category:
  - `supabase/sql/005_materials_drop_legacy_option_checks.sql`

### Fixed

- Custom added category/tillverkare values can now be persisted after applying the compatibility SQL (avoids `materials_category_check` legacy constraint errors).

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
