# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

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
