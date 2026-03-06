# Deployment

## Current state

- GitHub Pages deployment workflow is implemented.
- Workflow path: `.github/workflows/deploy-pages.yml`
- Workflow stages: install -> lint -> validate env -> build -> upload artifact -> deploy

## Target platform

- Frontend hosting: GitHub Pages
- Automation: GitHub Actions

## Required GitHub configuration (manual)

1. Go to `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Ensure workflow runs from your deployment branch (default `main`).
4. In `Settings -> Secrets and variables -> Actions`, add:
   - Variable: `VITE_SUPABASE_URL`
   - Secret: `VITE_SUPABASE_ANON_KEY`

## Pages compatibility strategy

- Router uses hash routing (`createHashRouter`) to avoid static-host rewrite issues.
- CI sets `VITE_BASE_PATH=/${{ github.event.repository.name }}/` during build.
- PWA manifest `start_url` uses hash route startup (`./#/materials`).

## Repository rename behavior

- The production build does not hardcode the current repository name.
- GitHub Actions derives the Pages base path from `github.event.repository.name` at build time.
- If the repository is renamed later, Pages asset paths and router base continue to work after the next deploy.
- No code change is required for the rename itself.

## Supabase auth redirect requirement

In Supabase Auth URL settings, add your deployed Pages URL:

- `https://<user>.github.io/<repo>/`

If you rename the GitHub repository, update both:

- `Site URL`
- `Additional Redirect URLs`

Recommended values after rename:

- `https://<user>.github.io/<new-repo>/`
- `https://<user>.github.io/<new-repo>/#/auth`

Without this redirect URL, magic-link sign-in will fail after deployment.

## Build-time validation

The workflow fails early if these are missing:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

This prevents deploying a non-connected build by accident.

## PWA deployment notes

- Manifest and service worker are generated at build time.
- v1 offline support covers static shell/assets only.
- Supabase CRUD is not available offline.
- After frontend updates on Pages, users may briefly see cached JS/PWA assets until a hard refresh loads the new bundle.

## Optional hardening (deferred)

- Environment-protected deploy approvals.
- Separate staging environment workflow.
