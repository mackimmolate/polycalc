# PolyFlow

PolyFlow is a clean, modern PWA for managing 3D printing materials.

## Current status

- Version: `0.2.2`
- Phase 1 completed: app foundation, routing, UI shell, PWA baseline, and GitHub Pages deployment workflow.
- Phase 1.1 completed: UI cleanup, Swedish localization, and materials list alignment polish.
- Phase 1.2 completed: overview information architecture and v1 data-model polish before Supabase integration.
- Data persistence is intentionally deferred to the next phase.

## Implemented in Phase 1

- Vite + React + TypeScript frontend scaffold
- React Router route foundation (GitHub Pages-safe via hash routing)
- Tailwind CSS v4 setup with a polished app shell
- Placeholder but real routes:
  - `/materials`
  - `/materials/:materialId`
  - `/materials/new`
  - `/materials/:materialId/edit`
  - `*` not found
- ESLint + Prettier tooling
- PWA foundation via `vite-plugin-pwa`:
  - Manifest
  - Service worker registration
  - Install prompt support
  - Placeholder icons
- GitHub Actions workflow for install, lint, build, and deploy to GitHub Pages
- `.env.example` and Supabase client scaffold (no CRUD yet)

## Refined in Phase 1.2

- Materials overview now emphasizes key material data directly in each card (name, manufacturer, category, price, max temperature, notes).
- Visible status and updated metadata were removed from the overview/filter UI to reduce noise.
- Active v1 model now uses one material name field (`name`) only.
- Manufacturer input in create/edit scaffolds is normalized through a canonical selectable option list.
- Preview data and frontend types now reflect the refined v1 model before backend integration.

## Quick start

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

### Quality checks

```bash
npm run lint
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Optional:

```bash
VITE_BASE_PATH=/
```

`VITE_BASE_PATH` defaults to `/` locally and is set to `/<repo>/` in GitHub Actions for Pages builds.

## Routing and Pages compatibility

- Routing uses `createHashRouter` for reliable static hosting behavior on GitHub Pages.
- Build assets use Vite `base` configuration that adapts for Pages in CI.

## PWA behavior (v1)

- The app shell and static assets are precached.
- Installability is supported when browser conditions are met.
- Advanced offline data sync is not implemented yet.
- Supabase-backed material CRUD is not available offline in Phase 1.

## Product scope (v1)

- Browse materials
- Search, filter, sort
- Material details
- Create/edit flows
- Archive/delete flows
- Core UX states (loading, empty, error, not found)

Out of scope:

- Export functionality

## Documentation map

- Repository guidance: [`AGENTS.md`](AGENTS.md)
- Version policy: [`VERSIONING.md`](VERSIONING.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Setup: [`docs/SETUP.md`](docs/SETUP.md)
- Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- Supabase: [`docs/SUPABASE.md`](docs/SUPABASE.md)
- Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
