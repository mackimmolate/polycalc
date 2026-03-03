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
- Calculation-aware material detail view
- Delete flow with double confirmation
- SQL setup assets for manual Supabase provisioning

## Phase 3 (next): Hardening and release readiness

- Add automated tests for critical flows (services + key UI states)
- Improve error observability and user-facing diagnostics
- Refine calculator UX with clearer unit hints and guardrails
- Optional pagination/virtualization strategy for larger datasets
- Final production checklist before `1.0.0`

## Deferred scope (v1)

- Export functionality
- Advanced role/permission system
- Offline mutation queue and sync
- Full manufacturer management subsystem
