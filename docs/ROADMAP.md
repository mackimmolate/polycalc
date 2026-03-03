# Roadmap

## Phase 0 (completed): Repository initialization

- Governance baseline (`AGENTS.md`)
- Documentation foundation
- Versioning and changelog baseline (`0.1.0`)

## Phase 1 (completed): App foundation

- Scaffold Vite + React + TypeScript
- Add Tailwind, ESLint, Prettier
- Configure routing and base app shell
- Add Supabase client setup (env-driven, no secrets)
- Add PWA baseline configuration
- Add GitHub Pages workflow (install, lint, build, deploy)

## Phase 2 (next): Material CRUD and data integration

- Replace preview data with Supabase-backed material list/detail/create/edit/update/archive flows
- Add route-level loading and error boundaries around real API calls
- Add validation and submit UX for create/edit forms
- Implement archive/delete confirmation flow against real persistence
- Harden empty/error states for production behavior

## Phase 3: Hardening and release readiness

- CI enhancements (typecheck/test gates as introduced)
- PWA behavior refinements and cache strategy tuning
- Supabase/RLS documentation finalization
- Documentation and release tightening

## Deferred scope (v1)

- Export functionality
- Advanced offline sync
- Complex auth/permissions model unless explicitly requested
