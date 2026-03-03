# Architecture

## Current state

- Phase 2 connected baseline is implemented.
- Runtime data is Supabase-backed for list/detail/create/edit/delete.
- PolyFlow v1 is implemented as material library plus a simple per-material calculator.

## Guiding principles

- Keep v1 simple, clear, and maintainable.
- Keep model boundaries explicit: fixed values vs user input vs calculated output.
- Use explicit module boundaries over clever abstractions.
- Keep GitHub Pages deployment compatibility first-class.

## Frontend structure

```text
src/
  app/
    App.tsx
    router.tsx
    providers/
    pwa/
  pages/
    materials/
    material-detail/
    material-create/
    material-edit/
    auth/
    not-found/
  features/
    materials/
      components/
      utils/
  components/
    layout/
    ui/
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

## Runtime flow

1. Pages call `services/materials/materialsService.ts`.
2. Service module executes Supabase reads/writes.
3. Service maps DB rows to typed domain model (`Material`).
4. UI components/pages render explicit loading, empty, error, and auth-required states.

## Material model (v1)

### Fixed values (persisted)

- `name`
- `manufacturer`
- `category`
- `pricePerKgEur`
- `maxTemperatureC`
- `timePerLayer45DegSeconds`
- `notes`
- `createdAt`
- `updatedAt`

### User-entered calculator values (not persisted)

- `kgMaterial`
- `printHours`

### Calculated values

- `materialCostEur = pricePerKgEur * kgMaterial`

## Routing strategy

- Router: `createHashRouter` in `src/app/router.tsx`
- Reason: stable behavior on GitHub Pages without rewrite rules.

Routes:

- `/` -> redirect to `/materials`
- `/materials` -> overview
- `/materials/new` -> create
- `/materials/:materialId` -> detail + calculator
- `/materials/:materialId/edit` -> edit
- `/auth` -> magic-link sign-in
- `*` -> not found

## Overview interaction model

- One visible search field.
- Sorting via clickable column headers.
- Compact row-based overview for quick side-by-side scanning.
- Row click opens deeper detail view.

## Auth and security model

- Supabase auth: magic link.
- Reads are public (RLS select policy).
- Writes require authenticated session (RLS insert/update/delete policies + frontend guard).
- No role system in v1.

## Delete behavior

- Primary destructive action in v1 is hard delete.
- UI requires double confirmation before delete API call.
- Archive is not part of active v1 destructive flow.

## PWA baseline

- `vite-plugin-pwa` with generated service worker.
- Static shell/assets cached.
- No offline CRUD or background sync in v1.
