# Decisions

This file records key product and engineering decisions.

## D-0001: Phased delivery is mandatory

- Date: 2026-03-03
- Status: Accepted
- Decision: Build PolyFlow in explicit phases with implementation + docs + version/changelog updates per phase.
- Reason: Reduces drift, improves reviewability, and keeps scope control in v1.

## D-0002: Stack baseline

- Date: 2026-03-03
- Status: Accepted
- Decision: Use Vite, React, TypeScript, React Router, Tailwind CSS, Supabase JS, `vite-plugin-pwa`, ESLint, Prettier.
- Reason: Fast setup, maintainable architecture, and good fit for PWA on GitHub Pages.

## D-0003: Use hash routing for GitHub Pages reliability

- Date: 2026-03-03
- Status: Accepted
- Decision: Use `createHashRouter` for runtime route handling.
- Reason: Eliminates static-host rewrite issues on GitHub Pages.

## D-0004: Export functionality excluded from v1

- Date: 2026-03-03
- Status: Accepted
- Decision: Do not build export in v1.
- Reason: Not part of core first-value scope.

## D-0005: Single material name field for v1

- Date: 2026-03-03
- Status: Accepted
- Decision: Use one field (`name`) and remove dual-name model direction.
- Reason: Reduces model/UI complexity.

## D-0006: Canonical manufacturer values in v1

- Date: 2026-03-03
- Status: Accepted
- Decision: Use centralized selectable manufacturer options.
- Reason: Prevents inconsistent value variants and improves data quality.

## D-0007: Compact row overview as primary comparison surface

- Date: 2026-03-03
- Status: Accepted
- Decision: Use compact rows instead of large cards for the materials overview.
- Reason: Better scanability and practical repeated use.

## D-0008: PolyFlow v1 is library plus simple calculator

- Date: 2026-03-03
- Status: Accepted
- Decision: Treat material detail as both information view and lightweight calculator.
- Reason: Users need to evaluate material suitability and cost quickly.

## D-0009: Final overview interactions are search plus sortable headers

- Date: 2026-03-03
- Status: Accepted
- Decision: Keep one visible search field and move sorting to clickable column headers.
- Reason: Reduces control clutter while preserving fast findability.

## D-0010: Supabase-backed runtime with service boundary

- Date: 2026-03-03
- Status: Accepted
- Decision: Replace preview runtime data with real Supabase CRUD behind services.
- Reason: Keeps API access centralized and maintainable.

## D-0011: Minimal auth model for safe writes

- Date: 2026-03-03
- Status: Accepted
- Decision: Use magic-link auth and RLS with public reads plus authenticated writes.
- Reason: Public frontend should not allow anonymous mutation by default.

## D-0012: Delete replaces archive in v1 destructive flow

- Date: 2026-03-03
- Status: Accepted
- Decision: Use hard delete as primary destructive action with double UI confirmation.
- Reason: Simpler v1 lifecycle and safer intentional destructive behavior.

## D-0013: Normalize time-per-layer storage in seconds

- Date: 2026-03-03
- Status: Accepted
- Decision: Store `time_per_layer_45_deg_seconds` as integer and render human-friendly format in UI.
- Reason: Stronger typing and cleaner calculations than free-text duration values.

## D-0014: Inline expandable workspace is the primary interaction model

- Date: 2026-03-04
- Status: Accepted
- Decision: Use inline row expansion in `/materials` as the main workflow surface instead of detail-page-first navigation.
- Reason: Reduces navigation friction and keeps comparison + calculation work in one place.

## D-0015: Calculations are first-class related records

- Date: 2026-03-04
- Status: Accepted
- Decision: Add `material_calculations` as a separate related entity (`materials` 1->N `material_calculations`).
- Reason: Supports multiple scenarios per material while keeping model boundaries clean.

## D-0016: Persist entered scenario values, derive results in UI

- Date: 2026-03-04
- Status: Accepted
- Decision: Persist `kg_material`, `print_time_hours`, and optional `label`; keep computed cost derived in the app.
- Reason: Clear separation between stored input and calculated output avoids stale duplicated values.

## D-0017: Detail route retained only as compatibility path

- Date: 2026-03-04
- Status: Accepted
- Decision: Keep `/materials/:materialId` route but redirect it to `/materials` with inline expansion state.
- Reason: Preserves deep-link compatibility while enforcing the overview-first UX.
