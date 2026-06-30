# Third-Party Licenses

Vita's own source code in this repository is licensed under the MIT License
(see `LICENSE`). That MIT grant covers **only this repository's code**. The
third-party components below keep their own licenses.

## Proprietary dependency (NOT covered by this repo's MIT license)

- **@monocircuit/monolithium** — proprietary, © monocircuit. All rights reserved.
  This is the closed-source UI library Vita is built on. It is consumed as a
  private package from GitHub Packages and is **bundled (minified) into the
  distributed app**. It is **not** open source and is **not** covered by this
  repository's MIT license. You may read and contribute to this repo's own code,
  but building/running the app requires access to the private `monocircuit`
  organization (see `README.md`).

## Bundled (in distributed app)

- **Simple Icons** — MIT License. https://github.com/simple-icons/simple-icons
  Used for company/brand logos. ~3000 brand SVGs.

- **@fontsource/geist-sans, @fontsource/geist-mono** — SIL Open Font License 1.1.
  https://github.com/vercel/geist-font

- **Dexie** — Apache-2.0. https://dexie.org
  IndexedDB wrapper used for all local data storage.

- **GSAP** — GreenSock Standard "No Charge" License. https://gsap.com/standard-license/
  Pulled in transitively via `@monocircuit/monolithium` and bundled into the
  distributed app. GSAP's standard license permits free use and distribution
  inside delivered apps but is **not** an OSI-approved open-source license.
  Compliance for GSAP (including any Club/bonus plugins) is owned on the
  monolithium side, since that is where GSAP is consumed.

- All other npm dependencies are permissive open source (MIT / ISC / Apache-2.0 /
  BSD / OFL / CC0 / Unlicense). See `package.json` and individual package
  licenses. Build-only/native components such as `lightningcss` (MPL-2.0) and
  `sharp`/libvips (Apache-2.0 + LGPL) run at build time only and are **not**
  shipped in the browser bundle.

## External Services (network calls)

- **Wikipedia REST API** — Wikipedia content is licensed under CC BY-SA 3.0
  Unported License. https://en.wikipedia.org
  When Wikipedia content (descriptions, thumbnails) is displayed in Vita, a
  "via Wikipedia" link points to the source page.

No data is sent to external services beyond what the user explicitly types into
Vita's search fields. No telemetry. No tracking.
