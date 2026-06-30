# Vita

Vita is a local-first **browser app** for building and editing an interactive
curriculum vitae. It runs entirely in the browser as an installable PWA — all
data is stored locally on your device (IndexedDB), there is **no backend server**
and no account.

## Stack

- **Frontend:** React 19, Vite, TanStack Router + Query, MUI 7, styled-components
- **Editor:** pixi.js canvas (timeline / dynamic rendering)
- **Local storage:** IndexedDB via [Dexie](https://dexie.org) — see `src/shared/data/db/`
- **PWA:** `vite-plugin-pwa` (Workbox) — installable, offline-capable
- **UI Library:** `@monocircuit/monolithium` (proprietary, private — via GitHub Packages)

## Data & privacy

All data lives only in your browser. There is no server, no sync, and no
telemetry. Use **Settings → Data & Backup** to export a JSON backup or to move
data to another browser/device.

## Local Setup

Vita depends on the private `@monocircuit/monolithium` UI library from GitHub
Packages. To install locally you need a GitHub Personal Access Token with
`read:packages` scope for the `monocircuit` organization.

```bash
export GITHUB_TOKEN=$(gh auth token)   # or: ghp_your_pat_here
pnpm install
pnpm dev
```

Then open the URL Vite prints (default http://localhost:5173).

Other scripts: `pnpm build` (static production build), `pnpm test` (Vitest),
`pnpm typecheck`, `pnpm lint`.

**External contributors:** the app's own source is open (MIT) and you can read it,
file issues, and discuss PRs. However, building/running Vita currently requires
access to the private `monocircuit` organization for `@monocircuit/monolithium`,
so the app is **source-available but not publicly buildable**.

## Project Structure

```
src/
├── routes/           # TanStack Router routes (dashboard, editor, …)
├── components/        # React components
├── shared/
│   ├── data/
│   │   ├── db/        # Local data layer: Dexie schema, dataApi, seed, backup
│   │   └── local/     # TanStack Query reader/writer hooks
│   ├── drawing/       # pixi.js canvas logic
│   └── processing/
└── lib/               # Inlined utility helpers (Emitter, date, logger)
```

## License

The source code in **this repository** is licensed under the **MIT License**
(see `LICENSE`).

That MIT license covers this repository's code only. The
`@monocircuit/monolithium` dependency is **proprietary and closed source**
(© monocircuit, all rights reserved); it is **not** covered by the MIT license,
even though it is bundled into the built app. See `LICENSES.md` for the full
third-party license breakdown (including GSAP, which is pulled in via
monolithium under the GreenSock standard license).
