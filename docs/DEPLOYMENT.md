# Deployment

## Current state

- GitHub Pages deployment workflow is implemented.
- Workflow path: `.github/workflows/deploy-pages.yml`

## Target platform

- Frontend hosting: GitHub Pages
- Automation: GitHub Actions (`build` + `deploy`)

## Required GitHub configuration (manual)

Configure repository settings:

1. Go to `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Confirm default branch is `main` (or update workflow trigger).
4. Ensure Actions permissions allow workflow runs.

## Pages compatibility requirements

- Vite base path must match repository Pages URL.
- React Router uses hash routing (`createHashRouter`) to avoid static-host rewrite issues.
- Static assets and PWA manifest paths must resolve correctly under the base path.

## Implemented workflow stages

1. Install dependencies
2. Lint
3. Build
4. Upload Pages artifact
5. Deploy

Build details:

- `VITE_BASE_PATH` is set during CI build to `/${{ github.event.repository.name }}/`.
- Node.js 20 is pinned in workflow setup.

## PWA deployment notes

- Manifest and service worker are generated at build time.
- Phase 1 caches static app shell/assets only.
- Supabase-backed dynamic data is not offline-synced in this phase.

## Deferred details

- Custom domain setup (if needed later).
- Environment-protected deploy approvals (optional hardening step).
