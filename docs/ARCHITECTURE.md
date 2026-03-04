# Architecture

## Current state

- Phase 2.3 shared option + sales-oriented calculation model is implemented.
- Runtime data is Supabase-backed for materials, shared option entities, and related calculation records.
- PolyFlow v1 is implemented as material library plus inline multi-calculation workspace.

## Guiding principles

- Keep v1 simple, clear, and maintainable.
- Keep model boundaries explicit: fixed values vs entered scenario values vs calculated output.
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
    material-options/
    material-calculations/
  api/
  lib/
    supabase/
  types/
  utils/
  styles/
```

## Runtime flow

1. `MaterialsListPage` loads materials and renders compact sortable rows.
2. One row can be expanded inline to open a material workspace.
3. Expanded workspace focuses on per-material calculations while fixed values remain visible in the compact summary row.
4. Calculation CRUD calls `services/material-calculations/materialCalculationsService.ts`.
5. Material CRUD calls `services/materials/materialsService.ts`.
6. Category/manufacturer option reads and mutations call `services/material-options/materialOptionsService.ts`.

## Data model boundaries

### Fixed values (persisted on `materials`)

- `name`
- `manufacturer_id` (FK -> `material_manufacturers.id`)
- `category_id` (FK -> `material_categories.id`)
- `pricePerKgEur`
- `maxTemperatureC`
- `timePerLayer45DegSeconds`
- `notes`

### Shared option values (persisted globally)

- `material_categories`: `label`, `normalized_key`, `is_active`
- `material_manufacturers`: `label`, `normalized_key`, `is_active`

### Entered scenario values (persisted on `material_calculations`)

- `label`
- `kgMaterial`
- `printTimeHours`
- `quantity`
- `machineHourlyRateEur`
- `laborCostPerPartEur`
- `postProcessCostPerPartEur`
- `setupTimeHours`
- `postProcessTimeHoursPerPart`
- `riskBufferPercent`
- `targetMarginPercent`
- `printerCount`

### Calculated values (derived in UI)

- `materialCostPerPart = pricePerKgEur * kgMaterial`
- `internalCostPerPart`
- `suggestedSalesPricePerPart`
- `batchInternalCost`
- `batchSalesTotal`
- `batchProfit`
- `leadTimeHours`

## Routing strategy

- Router: `createHashRouter` in `src/app/router.tsx`.
- Reason: stable behavior on GitHub Pages without rewrite rules.

Routes:

- `/` -> redirect to `/materials`
- `/materials` -> primary inline workspace
- `/materials/new` -> create material
- `/materials/:materialId/edit` -> edit material
- `/materials/:materialId` -> compatibility route that redirects back to inline workspace
- `/auth` -> magic-link sign-in
- `*` -> not found

## Overview interaction model

- One visible search field.
- Sorting via clickable column headers.
- Compact row-based overview for fast scanning and comparison.
- Expand/collapse inline workspace under each material row.
- One expanded material at a time by default.

## Auth and security model

- Supabase auth: magic link.
- Reads are public via RLS (`materials`, shared option tables, and `material_calculations`).
- Writes require authenticated session (insert/update/delete policies + frontend guards).
- No role system in v1.

## Delete behavior

- Material destructive action in v1 is hard delete with double confirmation.
- Calculation rows use simpler remove action with explicit user trigger.
- Shared category/manufacturer options are not hard-deleted in v1; they are inactivated (`is_active = false`) to avoid breaking existing material references.
- Archive is not part of active v1 destructive flow.

## PWA baseline

- `vite-plugin-pwa` with generated service worker.
- Static shell/assets cached.
- No offline CRUD or background sync in v1.
