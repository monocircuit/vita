import Dexie, { type Table } from 'dexie';
import type {
  Address,
  NewAddress,
  Chronicle,
  NewChronicle,
  ChronicleEntity,
  NewChronicleEntity,
  ChronicleRelation,
  NewChronicleRelation,
  Continent,
  NewContinent,
  Country,
  NewCountry,
  DynamicVita,
  NewDynamicVita,
  DynamicVitaPath,
  NewDynamicVitaPath,
  Entity,
  NewEntity,
  SeedState,
  Vita,
  NewVita,
  VitaShardDynamic,
  NewVitaShardDynamic,
} from './types';

/**
 * Local IndexedDB database for Vita. Stores mirror the former SQLite tables 1:1.
 *
 * Store schema notes:
 *   `++id`     auto-increment primary key (like SQLite AUTOINCREMENT)
 *   `&x`       unique index
 *   `[a+b]`    compound primary key (former composite PK)
 */
export class VitaDatabase extends Dexie {
  continents!: Table<Continent, number, NewContinent>;
  countries!: Table<Country, number, NewCountry>;
  addresses!: Table<Address, number, NewAddress>;
  vitas!: Table<Vita, number, NewVita>;
  chronicles!: Table<Chronicle, number, NewChronicle>;
  entities!: Table<Entity, number, NewEntity>;
  chronicleEntities!: Table<ChronicleEntity, [number, number], NewChronicleEntity>;
  chronicleRelations!: Table<ChronicleRelation, [number, number], NewChronicleRelation>;
  dynamicVitas!: Table<DynamicVita, number, NewDynamicVita>;
  dynamicVitaPaths!: Table<DynamicVitaPath, [number, number], NewDynamicVitaPath>;
  vitasShardsDynamic!: Table<VitaShardDynamic, number, NewVitaShardDynamic>;
  seedState!: Table<SeedState, string, SeedState>;

  constructor(name = 'vita') {
    super(name);
    this.version(1).stores({
      continents: '++id, continent',
      countries: '++id, &isoCode, continent',
      addresses: '++id, country',
      vitas: '++id',
      chronicles: '++id',
      entities: '++id, address',
      chronicleEntities: '[chronicleId+entityId], chronicleId, entityId',
      chronicleRelations: '[chronicleId+ancestor], chronicleId, ancestor',
      dynamicVitas: '++id',
      dynamicVitaPaths: '[dynamicVitaId+chronicleId], dynamicVitaId, chronicleId',
      vitasShardsDynamic: '++id, &[vitaId+chronicleId], vitaId, chronicleId',
      seedState: 'key',
    });
  }
}

/** Ordered list of every store name — used by backup export/import. */
export const STORE_NAMES = [
  'continents',
  'countries',
  'addresses',
  'vitas',
  'chronicles',
  'entities',
  'chronicleEntities',
  'chronicleRelations',
  'dynamicVitas',
  'dynamicVitaPaths',
  'vitasShardsDynamic',
  'seedState',
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

/** The singleton database used by the app (tests construct their own). */
export const db = new VitaDatabase();
