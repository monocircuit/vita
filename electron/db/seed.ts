import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

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

export function runSeed(db: BetterSQLite3Database<typeof schema>): void {
  const existing = db
    .select()
    .from(schema.seedState)
    .where(eq(schema.seedState.key, SEED_KEY))
    .get();

  if (existing) return;

  db.transaction((tx) => {
    const continentIdByName = new Map<string, number>();

    for (const name of CONTINENTS) {
      const row = tx
        .insert(schema.continents)
        .values({ continent: name })
        .returning()
        .get();
      continentIdByName.set(name, row.id);
    }

    for (const [iso, name, continentName] of COUNTRIES) {
      const continentId = continentIdByName.get(continentName);
      if (continentId == null) continue;
      tx.insert(schema.countries)
        .values({ isoCode: iso, name, continent: continentId })
        .run();
    }

    tx.insert(schema.seedState).values({ key: SEED_KEY }).run();
  });
}
