# Versioning Policy

PolyFlow uses Semantic Versioning (`MAJOR.MINOR.PATCH`).

## Current version

- `0.4.3`

## Rules

- `MAJOR`: incompatible API or architecture changes.
- `MINOR`: backward-compatible feature additions.
- `PATCH`: backward-compatible fixes, polish, or docs corrections.

## Pre-1.0 behavior

- Breaking changes may still occur while stabilizing the product.
- Even before `1.0.0`, all changes must be tracked clearly in `CHANGELOG.md`.

## Release discipline

- Every shipped increment updates:
  - `CHANGELOG.md`
  - Relevant `docs/*.md`
  - Version reference in this file when needed
- Deferred scope must be explicitly called out for each release.

## Milestones

- `0.1.0`: Documentation-first repository initialization.
- `0.2.0`: Phase 1 frontend foundation (app scaffold, routing, UI shell, PWA baseline, GitHub Pages workflow).
- `0.2.1`: Phase 1.1 UI polish (Swedish localization, CTA cleanup, table alignment, filter cleanup).
- `0.2.2`: Phase 1.2 information architecture and data-model polish before Supabase integration.
- `0.2.3`: Phase 1.3 compact row overview, EUR currency switch, and findability polish.
- `0.3.0`: Phase 2 connected v1 baseline (Supabase CRUD, minimal auth for writes, calculator-aware detail view, sortable overview headers, and delete double-confirm flow).
- `0.4.0`: Phase 2.1 inline expandable workspace with per-material multi-calculation CRUD and calculation-first overview workflow.
- `0.4.1`: UX refinement for clickable row affordance + saved/read-only calculation mode, plus custom category/manufacturer schema-compatibility hotfix.
- `0.4.2`: Form option persistence polish for category/manufacturer plus inline remove actions for custom options.
- `0.4.3`: Form option removal expanded to all dropdown values, with persisted hidden-option preferences and updated remove action labeling.
