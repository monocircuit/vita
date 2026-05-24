# Vita

Vita is currently being migrated from a SaaS web app to a locally installable Electron desktop app. This repository is in transition — see the migration plan in the parent platform repo for context.

## Current Stack

- **Frontend:** Next.js 16 (App Router), React 19, MUI 7, styled-components, pixi.js
- **Backend:** Supabase (will be replaced by local SQLite + Drizzle in Phase 3 of the migration)
- **UI Library:** `@monocircuit/monolithium` (private, via GitHub Packages)

## Local Setup

Vita requires a private dependency (`@monocircuit/monolithium`) from GitHub Packages. To install dependencies locally, you need a GitHub Personal Access Token with `read:packages` scope for the `monocircuit` organization.

```bash
export GITHUB_TOKEN=$(gh auth token)   # or: ghp_your_pat_here
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**External contributors:** local builds currently require access to the `monocircuit` GitHub organization. You can still read the source code, file issues, and discuss PRs.

## Project Structure

```
src/
├── app/              # Next.js App Router routes (will become React Router routes in Phase 4)
├── components/       # React components
├── shared/
│   ├── data/         # Data access layer (Supabase reader/writer hooks)
│   ├── drawing/      # pixi.js canvas logic
│   └── processing/
├── lib/              # Inlined utility helpers (Emitter, date, logger)
└── vendor/           # Temporarily absorbed packages (bridge, tanstack) — removed in Phase 3
```
