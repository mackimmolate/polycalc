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
- Reason: Fast setup, strong maintainability, good fit for PWA on GitHub Pages.

## D-0003: Auth deferred unless explicitly required

- Date: 2026-03-03
- Status: Accepted
- Decision: Do not implement auth in initial baseline unless a later phase explicitly requires it.
- Reason: Keeps v1 lean and focused on core material-management flows.

## D-0004: Export functionality excluded from v1

- Date: 2026-03-03
- Status: Accepted
- Decision: Do not build export in v1.
- Reason: Not core to first-value delivery and adds unnecessary complexity early.

## D-0005: Use hash routing for GitHub Pages reliability

- Date: 2026-03-03
- Status: Accepted
- Decision: Use `createHashRouter` for Phase 1 deployment compatibility on GitHub Pages.
- Reason: Eliminates static-host route refresh/rewrite issues and simplifies deployment baseline.

## D-0006: Phase 1 uses preview material data through services

- Date: 2026-03-03
- Status: Accepted
- Decision: Route pages consume local preview material data via `services/materials/materialsService.ts`.
- Reason: Enables real UI/routing iteration now without faking backend behavior.

## D-0007: Version bump to 0.2.0 for implemented foundation

- Date: 2026-03-03
- Status: Accepted
- Decision: Bump from `0.1.0` to `0.2.0` after delivering the full Phase 1 app/tooling/deploy baseline.
- Reason: Scope is a meaningful functional increment beyond documentation-only initialization.

## D-0008: Single material name field for v1

- Date: 2026-03-03
- Status: Accepted
- Decision: Use one material name field (`name`) and remove the dual-name `displayName` concept from active v1 direction.
- Reason: Reduces model/UI complexity and avoids confusion during material creation/editing.

## D-0009: Canonical manufacturer options in UI scaffolding

- Date: 2026-03-03
- Status: Accepted
- Decision: Replace free-text manufacturer entry with a centralized selectable option list in create/edit scaffolds.
- Reason: Prevents inconsistent naming (for example case/spelling variants) and improves future data quality for Supabase.

## D-0010: Overview focuses on key material data, not status metadata

- Date: 2026-03-03
- Status: Accepted
- Decision: Hide visible status and updated metadata in overview/filter UI and show key material fields directly in labeled overview cards.
- Reason: Improves scanability and keeps the overview focused on practical browsing information.
