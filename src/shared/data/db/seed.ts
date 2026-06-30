// Reference-data seed (continents + countries), ported 1:1 from
// `electron/db/seed.ts`. Idempotent: guarded by a row in the `seedState` store.

import type { VitaDatabase } from './dexie';

const SEED_KEY = 'continents_and_countries_v1';

const CONTINENTS: string[] = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
];

const COUNTRIES: ReadonlyArray<readonly [iso: string, name: string, continent: string]> = [
  ['AD', 'Andorra', 'Europe'],
  ['AE', 'United Arab Emirates', 'Asia'],
  ['AF', 'Afghanistan', 'Asia'],
  ['AT', 'Austria', 'Europe'],
  ['AU', 'Australia', 'Oceania'],
  ['BE', 'Belgium', 'Europe'],
  ['BR', 'Brazil', 'South America'],
  ['CA', 'Canada', 'North America'],
  ['CH', 'Switzerland', 'Europe'],
  ['CN', 'China', 'Asia'],
  ['CZ', 'Czech Republic', 'Europe'],
  ['DE', 'Germany', 'Europe'],
  ['DK', 'Denmark', 'Europe'],
  ['EG', 'Egypt', 'Africa'],
  ['ES', 'Spain', 'Europe'],
  ['FI', 'Finland', 'Europe'],
  ['FR', 'France', 'Europe'],
  ['GB', 'United Kingdom', 'Europe'],
  ['GR', 'Greece', 'Europe'],
  ['IE', 'Ireland', 'Europe'],
  ['IN', 'India', 'Asia'],
  ['IT', 'Italy', 'Europe'],
  ['JP', 'Japan', 'Asia'],
  ['KR', 'South Korea', 'Asia'],
  ['LU', 'Luxembourg', 'Europe'],
  ['MX', 'Mexico', 'North America'],
  ['NL', 'Netherlands', 'Europe'],
  ['NO', 'Norway', 'Europe'],
  ['NZ', 'New Zealand', 'Oceania'],
  ['PL', 'Poland', 'Europe'],
  ['PT', 'Portugal', 'Europe'],
  ['RU', 'Russia', 'Europe'],
  ['SE', 'Sweden', 'Europe'],
  ['SG', 'Singapore', 'Asia'],
  ['TR', 'Turkey', 'Asia'],
  ['UA', 'Ukraine', 'Europe'],
  ['US', 'United States', 'North America'],
  ['ZA', 'South Africa', 'Africa'],
] as const;

/**
 * Seeds continents + countries on first run. Safe to call on every app start —
 * it returns immediately once the seed marker is present.
 */
export async function ensureSeed(db: VitaDatabase): Promise<void> {
  const existing = await db.seedState.get(SEED_KEY);
  if (existing) return;

  await db.transaction('rw', db.continents, db.countries, db.seedState, async () => {
    // Re-check inside the transaction to avoid a double-seed race.
    if (await db.seedState.get(SEED_KEY)) return;

    const continentIdByName = new Map<string, number>();
    for (const name of CONTINENTS) {
      const id = await db.continents.add({ continent: name });
      continentIdByName.set(name, id);
    }

    for (const [iso, name, continentName] of COUNTRIES) {
      const continentId = continentIdByName.get(continentName);
      if (continentId == null) continue;
      await db.countries.add({ isoCode: iso, name, continent: continentId });
    }

    await db.seedState.add({ key: SEED_KEY, appliedAt: new Date() });
  });
}
