# Versioning Policy

PolyFlow uses Semantic Versioning (`MAJOR.MINOR.PATCH`).

## Current version

- `0.2.0`

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
