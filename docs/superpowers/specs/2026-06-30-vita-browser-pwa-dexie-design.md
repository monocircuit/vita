# Vita: Von Electron-Desktop zu Browser-PWA mit lokaler Speicherung (Dexie/IndexedDB)

**Status:** Genehmigt — Implementierung autonom
**Datum:** 2026-06-30
**Autor:** Benedikt Nau (mit Claude)
**Scope:** Pivot der Vita-App weg von der Electron-Desktop-Distribution hin zu einer rein im Browser laufenden, installierbaren PWA. Alle Daten lokal im Browser (IndexedDB via Dexie). Kein Backend-Server, keine Electron-Shell, kein SQLite-im-Hauptprozess. **Das Verhalten muss verhaltensgleich zur originalen Next.js-App bleiben — nur ohne Server.**

---

## 1. Zusammenfassung

Vita wurde bereits vom ursprünglichen Next.js + Supabase Stack zu einer Vite + React + TanStack Router/Query App migriert, die in einer Electron-Shell mit lokalem SQLite (better-sqlite3 + Drizzle, angesprochen über IPC) läuft. Statt diese als installierbare Desktop-App zu vertreiben, wird die App jetzt als **kostenlos im Browser nutzbare PWA** angeboten.

Kerngedanke: Der gesamte Renderer (React, TanStack Router/Query, MUI, pixi.js-Editor, Timeline, Formulare) **bleibt unverändert**. Ausgetauscht wird ausschließlich die Datenschicht: Die ~23 TanStack-Query-Hooks rufen heute `window.api.*` (Electron-IPC → SQLite) auf; künftig rufen sie ein `dataApi`-Modul auf, das denselben Vertrag gegen **Dexie (IndexedDB)** im Browser erfüllt.

## 2. Ziele & Non-Goals

### Ziele
1. Vita läuft vollständig im Browser, ohne jeden Server.
2. Alle Daten liegen lokal im Browser (IndexedDB).
3. Installierbar als PWA (Manifest + Service Worker, offline-fähig).
4. **Verhaltensgleich zur originalen Next.js/Supabase-App** — identische Datenlogik, nur lokal.
5. Manuelles Backup: Export/Import aller Daten als Datei.
6. Statisch hostbar (z. B. GitHub Pages / Cloudflare / Netlify). Repo bleibt privat, `@monocircuit/monolithium` wird beim Build mitgebundlet.

### Non-Goals
- Kein Cloud-Sync, keine Multi-User-Unterstützung, keine Realtime.
- Keine Electron-Distribution mehr (Desktop-Installer entfallen).
- Keine Quelloffenheit/Nachbaubarkeit für Externe (monolithium bleibt private Dependency).
- Keine Migration bestehender SQLite-/Supabase-Daten (es gibt keine produktiven Daten).

## 3. Ausgangslage (Ist-Zustand im vita-Repo)

- **Renderer:** `src/` — React 19, TanStack Router (`routeTree.gen.ts`), TanStack Query, MUI 7 + styled-components, pixi.js-Editor. Bleibt 1:1.
- **Datenschicht (Renderer):** `src/shared/data/local/*` — 23 Reader/Writer-Hooks auf Basis von TanStack Query, die `window.api.*` aufrufen.
- **Datenschicht (Main):** `electron/ipc/*.ts` — IPC-Handler mit Drizzle-Queries gegen better-sqlite3. `electron/db/schema.ts` (Drizzle-Schema, 12 Tabellen), `electron/db/seed.ts` (Referenzdaten), `electron/db/client.ts`.
- **Contract:** `electron/ipc/contracts.ts` definiert `interface Api` (inkl. `updater` für Electron-Autoupdate).
- **Electron-Spezifika:** `electron/` (main, preload, updater), `electron-builder.yml`, `electron-updater`, `src/features/updates/*`, Release-CI.

**Faithfulness-Befund:** Die originale Supabase-Logik (`products/vita/src/shared/data/tables/` im Platform-Monorepo) nutzt **kein** `.order()`, `.range()`, `.rpc()`, `.limit()` — nur `.eq()`/`.in()`-Filter und ein `.single()`. Der Electron-IPC-Port bildet diese Semantik bereits getreu ab. Daher ist „Electron-Handler → Dexie portieren" verhaltensgleich zum Original; es gibt keine versteckte Sortier-/Pagination-Semantik zu erhalten.

## 4. Zielarchitektur

```
Browser (PWA, statisch gehostet, HTTPS)
├─ React + TanStack Router/Query        ← unverändert
├─ Editor (pixi.js, Timeline, Forms)    ← unverändert
├─ src/shared/data/local/*  (23 Hooks)  ← nur: window.api.X → dataApi.X
└─ src/shared/data/db/  (NEU)
    ├─ types.ts     Row-Typen + Enums (portiert aus Drizzle-Schema)
    ├─ contract.ts  interface Api (ohne `updater`)
    ├─ dexie.ts     Dexie-DB-Klasse, 12 Stores, Schema-Versionierung
    ├─ seed.ts      Referenzdaten (Kontinente/Länder), idempotent
    ├─ dataApi.ts   erfüllt Api-Contract gegen Dexie (getreuer Logik-Port)
    ├─ backup.ts    Export → Datei, Import → bulkPut
    └─ index.ts     re-exports (dataApi, Typen)

ENTFÄLLT: electron/, electron-builder.yml, electron-updater, electron-log,
          better-sqlite3, drizzle-orm/-kit, drizzle.config.ts,
          src/features/updates/*, Dockerfile, docker-compose.*, supabase/,
          window.api-Global, scripts/release, electron-bezogene package.json-Scripts
```

**Daten-Layer-Tausch (Ansatz B):** Kein `window.api`-Global mehr. Neues `dataApi`-Objekt erfüllt denselben `Api`-Typ (der Contract wandert nach `src/shared/data/db/contract.ts`, ohne `updater`). In den 23 Hooks wird mechanisch `window.api` → `dataApi` getauscht; Import-Pfad `electron/ipc/contracts` → `src/shared/data/db/contract` bzw. `.../db`.

## 5. Datenschicht-Port (das Kernstück — getreue Logik-Übernahme)

### 5.1 Dexie-Stores (1:1 aus dem Drizzle-Schema)

`++id` = auto-increment PK, `&` = unique, `[a+b]` = Compound-PK:

```
continents:          ++id, continent
countries:           ++id, &isoCode, continent
addresses:           ++id, country
vitas:               ++id
chronicles:          ++id
entities:            ++id, address
chronicleEntities:   [chronicleId+entityId], chronicleId, entityId
chronicleRelations:  [chronicleId+ancestor], chronicleId, ancestor
dynamicVitas:        ++id
dynamicVitaPaths:    [dynamicVitaId+chronicleId], dynamicVitaId, chronicleId
vitasShardsDynamic:  ++id, &[vitaId+chronicleId], vitaId, chronicleId
seedState:           key
```

### 5.2 Typen

Row-Typen + Enums (`Scope`, `VitaType`, `ChronicleCategory`, `ChronicleOrientation`, `MaritalStatus`) werden aus `electron/db/schema.ts` als **explizite TS-Typen** nach `src/shared/data/db/types.ts` portiert (kein drizzle-orm mehr). Timestamps als epoch-ms `number`. Der `Api`-Contract (ohne `updater`) plus die abgeleiteten Typen (`ChronicleView`, `NewChronicleInput`, `ChroniclePatch`, `VitaPatch`, `EntityPatch`, `AddressPatch`, `ShardReplaceInput`) wandern nach `src/shared/data/db/contract.ts`.

### 5.3 Auto-Increment & Timestamps

- IDs: Dexie `++id` liefert wie SQLite `autoIncrement` aufsteigende Integer.
- `create`/`insert … returning … get()` → Dexie `add()` gibt den neuen Key zurück → Zeile per `get(key)` zurücklesen und zurückgeben (identische Rückgabe-Form).
- `updatedAt`: wird in `update` auf `Date.now()` gesetzt — **außer bei `addresses`** (hat keine `updatedAt`-Spalte; Original-Handler setzt dort keins).
- `createdAt`: bei `create` auf `Date.now()`, falls nicht im Input.

### 5.4 Cascade-Deletes (manuell in Dexie-Transaktionen nachgebaut)

SQLite-`onDelete: 'cascade'` existiert in Dexie nicht — in `db.transaction('rw', …)` explizit:

| Löschen von | kaskadiert zu |
|---|---|
| `vita` | `vitasShardsDynamic` where `vitaId` |
| `chronicle` | `chronicleEntities` (chronicleId), `chronicleRelations` (chronicleId **und** ancestor), `dynamicVitaPaths` (chronicleId), `vitasShardsDynamic` (chronicleId) |
| `entity` | `chronicleEntities` (entityId) |
| `dynamicVita` | `dynamicVitaPaths` (dynamicVitaId) |

> Hinweis: `chronicles` hat **keine** `vitaId`-Spalte. Chronicles sind global und werden nur über `vitasShardsDynamic`/`dynamicVitaPaths` mit Vitas verknüpft. Das wird exakt so übernommen.

### 5.5 Handler-für-Handler: exaktes Zielverhalten

Jede `dataApi`-Methode reproduziert den entsprechenden `electron/ipc/*`-Handler 1:1:

- **vitas**: `list` = alle; `byId`; `create` (returning); `update` setzt `updatedAt=now`; `delete` (+ cascade 5.4).
- **chronicles**:
  - `toView(row)`: `knots`-String → `number[]` via `JSON.parse`, dann `Array.isArray ? map(Number).filter(Number.isFinite) : []`; bei Parse-Fehler `[]`. **Alle chronicle-Rückgaben laufen durch `toView` → Renderer erhält `knots: number[]`.**
  - intern in IndexedDB wird `knots` als **String** gespeichert (wie SQLite).
  - `list`/`byId` → `toView`.
  - `byVitaId(vitaId)`: erst `chronicleId`s aus `vitasShardsDynamic` where `vitaId`; wenn leer → `[]`; sonst Chronicles mit `id ∈ chronicleIds` → `toView`.
  - `create`: `knots = JSON.stringify(input.knots ?? [])`, insert, `toView`.
  - `update`: `{ ...patch, updatedAt=now }`; falls `patch.knots !== undefined` → `knots = JSON.stringify(patch.knots)`; `toView`.
  - `delete` (+ cascade 5.4).
- **entities**: Standard-CRUD; `update` setzt `updatedAt=now`; `delete` (+ cascade 5.4).
- **chronicleEntities**:
  - `list` = alle.
  - `linkMany(chronicleId, entityIds)`: leere Liste → `[]`; in Transaktion je `entityId`: existierende `[chronicleId+entityId]`-Zeile wiederverwenden (in Ergebnis aufnehmen, nicht neu anlegen), sonst anlegen; gibt Liste der (bestehenden oder neuen) Zeilen zurück.
  - `unlink(chronicleId, entityId)`; `unlinkAllForChronicle(chronicleId)`.
- **chronicleRelations**: `listByChronicleId`; `create` (returning); `delete(chronicleId, ancestor)`.
- **shards**:
  - `byVitaId(vitaId)` = alle Shards where `vitaId`.
  - `replaceForVita(vitaId, shards)`: in Transaktion erst alle Shards where `vitaId` löschen; leere Liste → `[]`; sonst neue Shards mit `{ ...shard, vitaId }` einfügen und zurückgeben. (prevId/nextId-Verkettung kommt 1:1 aus dem Input.)
- **dynamicVitas**: CRUD; `update` setzt `updatedAt=now`; `delete` (+ cascade 5.4).
- **dynamicVitaPaths**:
  - `listByDynamicVitaId`.
  - `upsert(input)`: `knots` zu String normalisieren (`typeof === 'string' ? input.knots : JSON.stringify(input.knots ?? [])`); existierende `[dynamicVitaId+chronicleId]`-Zeile → update `{ knots, updatedAt=now }`, sonst insert `{ ...input, knots }`.
  - `delete(dynamicVitaId, chronicleId)`.
- **addresses**: `list`; `create`; `update` setzt patch **ohne** `updatedAt`. (Kein `delete` im Original — wird nicht hinzugefügt.)
- **countries**: `list`. **continents**: `list`.

### 5.6 Seed (Referenzdaten)

`seed.ts` reproduziert `electron/db/seed.ts`: idempotent über `seedState`-Key `continents_and_countries_v1`. Beim ersten Start: 7 Kontinente + ~38 Länder einfügen (Länder referenzieren Kontinent per aufgelöster `continent`-ID). Lauf beim App-Bootstrap **vor** dem ersten Daten-Read (countries/continents sind Referenzdaten, die Formulare brauchen).

## 6. Bootstrap & DB-Lifecycle

- Dexie-DB `vita` mit Schema-Version 1 (`db.version(1).stores(...)`). Spätere Schema-Änderungen über höhere Versionen (Dexie-Upgrades) statt Drizzle-Migrations.
- App-Bootstrap (`src/main.tsx` / Router-Root): `await db.open()` → `await ensureSeed(db)` → Render. Reader brauchen die DB asynchron (passt zu TanStack Query).
- `navigator.storage.persist()` beim Start anfragen, damit der Browser die Daten nicht unter Speicherdruck verwirft (best effort).

## 7. PWA

- `vite-plugin-pwa` (Workbox), `registerType: 'autoUpdate'`.
- **Manifest:** `name`/`short_name` „Vita", `display: standalone`, `start_url: '/'`, `theme_color`/`background_color`, Icons 192/512 (inkl. `maskable`). Bestehende Icon-Assets/`scripts/generate-*` wiederverwenden bzw. einfache Icons erzeugen.
- **Service Worker:** Precache der App-Shell (JS/CSS/Fonts/HTML). Keine Runtime-API-Caches nötig (Daten sind lokal). Damit offline voll funktionsfähig.
- Update-Hinweis: optionaler „Neue Version verfügbar – neu laden"-Toast (ersetzt den entfallenden Electron-Updater; minimal gehalten).

## 8. Export / Import (Backup)

- `backup.ts`:
  - **Export:** alle 12 Stores lesen → `{ formatVersion: 1, exportedAt, schemaVersion, tables: { … } }` → JSON-Blob → Download `vita-backup-YYYY-MM-DD.json`.
  - **Import:** Datei wählen → parsen → `formatVersion` prüfen → Bestätigung „Alle vorhandenen Daten ersetzen?" → in Transaktion alle Stores leeren + `bulkPut`. Danach Query-Cache invalidieren.
- UI: schlichter Einstieg (Buttons „Backup herunterladen" / „Backup einspielen") im Dashboard/Settings-Bereich.

## 9. Cleanup & Hosting

- **Entfernen:** `electron/`, `electron-builder.yml`, `drizzle.config.ts`, `src/features/updates/*`, `scripts/` (electron/release-spezifisch), `Dockerfile`, `docker-compose.*`, `supabase/`, electron/SQLite/drizzle-Devdeps & -Deps, electron-bezogene `package.json`-Scripts (`build:electron`, `start:electron`, `dev:electron`, `dist:test`, `db:*`, `icons:generate` falls electron-spezifisch, `verify-build` falls electron-spezifisch).
- `global.d.ts`: `window.api`-Typing entfernen.
- `vite.config.ts`: `vite-plugin-electron` raus, `vite-plugin-pwa` rein.
- **Build:** `pnpm build` → statisches `dist/`.
- **Hosting:** statischer Host mit HTTPS (GitHub Pages / Cloudflare Pages / Netlify). CI baut mit `GITHUB_TOKEN` (zieht privates monolithium aus GitHub Packages, bundlet es) und deployt `dist/`. Release-Matrix-Workflow (3-OS Electron-Build) entfällt.
- Nicht mehr genutzte Next.js/Supabase-Altlast-Deps (`cookie`, `jwt-decode`, `winston`, `swr`) nur entfernen, wenn nachweislich ungenutzt; sonst stehen lassen (Fokus: lauffähig, nicht maximal aufgeräumt).

## 10. Tests

- **Vitest** (Vite-nativ) + **fake-indexeddb** für `dataApi`-Unit-Tests gegen die in 5.5 dokumentierten Verhalten:
  - CRUD je Tabelle, `byId`/`list`-Formen.
  - `chronicles.toView` (knots-Parsing inkl. kaputter Eingaben → `[]`).
  - `chronicles.byVitaId` über Shards (leer → `[]`).
  - `chronicleEntities.linkMany` Dedup (bestehende werden wiederverwendet).
  - `shards.replaceForVita` (Delete-then-insert, leer → `[]`).
  - `dynamicVitaPaths.upsert` (insert vs. update by composite key).
  - Cascade-Deletes (5.4).
  - `update` setzt `updatedAt` (bzw. addresses nicht).
  - Backup-Round-Trip: export → frische DB → import → identische Daten.
- Seed-Idempotenz (zweimal seeden ändert nichts).

## 11. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Browser verwirft IndexedDB unter Speicherdruck | `navigator.storage.persist()` anfragen; Export/Import als Backup |
| Privater/Inkognito-Modus persistiert nicht | Akzeptiert; ggf. dezenter Hinweis |
| Manuelle Cascades unvollständig | Durch Tests (5.4) abgesichert |
| `knots`-Form (String intern, `number[]` extern) inkonsistent | `toView`/`stringify` exakt aus Original übernommen + getestet |
| monolithium privat → Build nur mit Token | CI nutzt `GITHUB_TOKEN` (wie bisher); Bundle enthält monolithium (akzeptiert) |
| Daten nur in einem Browser | Export/Import; Cloud-Sync explizit out of scope |

## 12. Umsetzungsreihenfolge

1. Deps: `dexie`, `vite-plugin-pwa` hinzu; `vitest`, `fake-indexeddb` (dev). Vitest-Config.
2. `src/shared/data/db/`: `types.ts`, `contract.ts`, `dexie.ts`, `seed.ts`.
3. `dataApi.ts` (getreuer Port) — testgetrieben gegen 5.5/5.10.
4. `backup.ts` + Tests.
5. Hooks umstellen (`window.api` → `dataApi`), Import-Pfade, `global.d.ts`.
6. Bootstrap (open + seed + persist) in `main.tsx`.
7. `src/features/updates/*` entfernen, Mounts ausbauen.
8. PWA in `vite.config.ts` + Manifest/Icons + optionaler Update-Toast.
9. Export/Import-UI.
10. Cleanup electron/SQLite/Docker/supabase + CI auf statisch.
11. Verifikation: `pnpm lint`, `tsc`, `vitest`, `pnpm build` grün; manueller Smoke-Test (`pnpm dev`).

---

**Ende des Spec-Dokuments.**
