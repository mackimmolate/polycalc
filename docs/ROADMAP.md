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

## Phase 3 (next): Hardening and release readiness

- Add automated tests for critical flows (material + calculation services and key UI states)
- Improve error observability and user-facing diagnostics
- Optimize performance for larger material/calculation datasets
- Final production checklist before `1.0.0`

## Deferred scope (v1)

- Export functionality
- Advanced role/permission system
- Offline mutation queue and sync
- Full manufacturer management subsystem
