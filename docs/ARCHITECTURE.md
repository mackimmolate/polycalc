# Architecture

## Current state

- Phase 1 scaffold is implemented with a deploy-ready frontend foundation.
- Data persistence is still deferred; current data shown in routes is preview fixture data.

## Guiding principles

- Keep v1 simple, clear, and maintainable.
- Use explicit module boundaries over clever abstractions.
- Keep domain types and UI flows aligned with real material management tasks.
- Make future extension easy without adding premature complexity.

## Implemented frontend structure

```
src/
  app/
    App.tsx
    router.tsx
    pwa/
  pages/
    materials/
    material-detail/
    material-create/
    material-edit/
    not-found/
  features/
    materials/
      components/
      data/
      utils/
  components/
    ui/
    layout/
  hooks/
  services/
    materials/
  api/
  lib/
    supabase/
  types/
  utils/
  styles/
```

## Data model direction (v1)

Primary entity: `material`

- `id`
- `name`
- `displayName`
- `category`
- `manufacturer`
- `pricePerKg`
- `maxTemperature`
- `notes`
- `status` (`active` | `archived`)
- `createdAt`
- `updatedAt`

## Routing strategy

- Router implementation: `createHashRouter` (`src/app/router.tsx`)
- Reason: reliable route handling on GitHub Pages static hosting without server-side rewrites.

Routes:

- `/` -> redirect to `/materials`
- `/materials` -> materials list page
- `/materials/new` -> create material page
- `/materials/:materialId` -> material detail page
- `/materials/:materialId/edit` -> edit material page
- `*` -> not found page

## State and data strategy

- Keep global state minimal.
- Use local page state + lightweight service modules for fetching/mutations.
- Keep form state local to create/edit views.
- Handle loading, empty, and error states explicitly per screen.
- Phase 1 services return preview fixture data; Supabase CRUD is deferred.

## UI foundation

- App shell with sticky top navigation and responsive layout container.
- Reusable UI components for page heading, cards, and status badges.
- Tailwind CSS v4 plus CSS variable design tokens in `src/styles/index.css`.
- Mobile and desktop responsive behavior is built into route pages.

## PWA foundation

- `vite-plugin-pwa` configured in `vite.config.ts`.
- Service worker registration in `src/app/pwa/registerServiceWorker.ts`.
- Install prompt handling via `src/hooks/usePwaInstall.ts`.
- Manifest and icon assets are included.
- Offline scope in Phase 1: static shell/assets only (no offline data sync).

## Auth direction

- Auth is deferred for v1 unless later required by phase scope.
- If auth is introduced later, update this document and `docs/SUPABASE.md`.
