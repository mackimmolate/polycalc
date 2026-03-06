# AGENTS.md

This file defines durable working rules for PolyCalc contributors and future Codex passes.

## Product principles

- Build a clean, modern, minimal PWA for managing 3D printing materials.
- Treat PolyCalc as `material library + inline multi-scenario calculator` in v1.
- Keep the active calculation workflow focused on `självkostnad`, not sales pricing or margin policy.
- Optimize for clarity, speed, low cognitive load, and maintainability.
- Prefer simple architecture and strong defaults over clever abstractions.
- Document intentional deferrals explicitly.
- Avoid feature creep in v1 (for example: no broad export platform beyond scoped self-cost PDF export).

## Architecture expectations

- Keep a feature-oriented frontend structure with clear module boundaries.
- Use TypeScript everywhere with strict typing and explicit domain types.
- Keep routing simple and predictable with React Router.
- Maintain GitHub Pages compatibility using hash-based routing unless a documented replacement is approved.
- Keep data access behind small service/api modules (no scattered Supabase calls).
- Keep files focused; avoid giant multi-purpose files.
- Avoid circular dependencies and hidden cross-feature coupling.

## Coding style expectations

- Prefer readable, explicit code over compact tricks.
- Use small pure utility functions where they improve clarity.
- Add concise comments only where logic is non-obvious.
- Keep naming domain-oriented (`material`, `materialCalculation`, `pricePerKgEur`, `timePerLayer45DegSeconds`, etc.).
- Use ESLint + Prettier as required quality gates.

## UI and UX expectations

- Prioritize scanability and clear visual hierarchy.
- Keep materials overview compact and comparison-friendly.
- Keep one primary search control in overview and sortable column headers for sorting.
- Make inline expandable rows the primary workflow surface.
- Support multiple calculations directly within an expanded material workspace.
- Ship mobile-friendly and desktop-friendly layouts from the start.
- Include loading, empty, error, auth-required, and not-found states as first-class UX.
- Keep destructive actions explicit and safe (material delete uses double confirmation in v1).

## Documentation expectations

- Keep docs aligned with the actual codebase state.
- Update `README.md`, `CHANGELOG.md`, and relevant `docs/*.md` in the same change set.
- Record meaningful architecture/product decisions in `docs/DECISIONS.md`.
- Do not leave undocumented scaffolding or fake "coming soon" claims.

## Versioning discipline

- Follow Semantic Versioning.
- Current active baseline is `0.7.4`; increment only for real delivered scope.
- Every versioned change must update `CHANGELOG.md`.
- Document assumptions and deferred scope for each milestone.

## Deployment expectations

- Target GitHub Pages hosting via GitHub Actions.
- Configure Vite base path and React Router strategy for Pages compatibility.
- Keep static asset paths and PWA asset generation Pages-safe.
- Ensure Pages builds inject Supabase URL/key via Actions variable/secret.
- Document required repository settings in `docs/DEPLOYMENT.md`.
- Keep `.github/workflows/deploy-pages.yml` aligned with actual build/lint/deploy commands.

## Security and Supabase expectations

- Use environment variables for Supabase URL and anon key only.
- Never commit service-role keys or other secrets.
- Keep auth minimal unless explicitly expanded in scope.
- Keep public read and authenticated write behavior explicit via RLS documentation.
- Keep category/manufacturer option data Supabase-backed and shared (no browser-local source-of-truth model).
- Document schema and RLS decisions in `docs/SUPABASE.md`.

## What to avoid

- No premature microservices or backend overengineering.
- No heavyweight state management unless real complexity requires it.
- No dead code or placeholder systems without documentation.
- No undocumented breaking architectural changes.
