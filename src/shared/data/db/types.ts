// Row + insert types for the local (browser) database.
//
// Ported 1:1 from the former Drizzle schema (`electron/db/schema.ts`). The
// shapes match Drizzle's `$inferSelect` / `$inferInsert` so the renderer sees
// exactly the same data it received over Electron IPC:
//   - `timestamp_ms` columns surface as `Date` objects
//   - `chronicles.knots` is stored as a JSON string (converted to `number[]`
//     for the renderer via `ChronicleView`, see contract.ts)
//   - columns without `.notNull()` are nullable; columns with a default are
//     optional on insert.

// ============ Enums (stored as TEXT) ============

export const scopeValues = ['private', 'public', 'restricted'] as const;
export type Scope = (typeof scopeValues)[number];

export const vitaTypeValues = ['DYNAMIC', 'STATIC'] as const;
export type VitaType = (typeof vitaTypeValues)[number];

export const chronicleCategoryValues = [
  'work experience',
  'education',
  'internship',
  'volunteering',
  'hobby',
] as const;
export type ChronicleCategory = (typeof chronicleCategoryValues)[number];

export const chronicleOrientationValues = ['above', 'below', 'neutral'] as const;
export type ChronicleOrientation = (typeof chronicleOrientationValues)[number];

export const maritalStatusValues = [
  'single',
  'married',
  'divorced',
  'widowed',
  'separated',
  'partnered',
] as const;
export type MaritalStatus = (typeof maritalStatusValues)[number];

// ============ Reference Tables ============

export type Continent = {
  id: number;
  continent: string;
}
export type NewContinent = {
  id?: number;
  continent: string;
}

export type Country = {
  id: number;
  isoCode: string;
  name: string;
  continent: number | null;
}
export type NewCountry = {
  id?: number;
  isoCode: string;
  name: string;
  continent?: number | null;
}

export type Address = {
  id: number;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: number | null;
}
export type NewAddress = {
  id?: number;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: number | null;
}

// ============ User-scoped Tables ============

export type Vita = {
  id: number;
  name: string;
  type: VitaType;
  scope: Scope | null;
  createdAt: Date;
  updatedAt: Date | null;
}
export type NewVita = {
  id?: number;
  name: string;
  type: VitaType;
  scope?: Scope | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type Chronicle = {
  id: number;
  title: string;
  description: string | null;
  category: ChronicleCategory | null;
  orientation: ChronicleOrientation | null;
  scope: Scope;
  /** JSON-encoded number[] — see ChronicleView for the decoded shape. */
  knots: string;
  createdAt: Date;
  updatedAt: Date | null;
}
export type NewChronicle = {
  id?: number;
  title: string;
  description?: string | null;
  category?: ChronicleCategory | null;
  orientation?: ChronicleOrientation | null;
  scope: Scope;
  knots?: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type Entity = {
  id: number;
  name: string;
  address: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}
export type NewEntity = {
  id?: number;
  name: string;
  address?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type ChronicleEntity = {
  chronicleId: number;
  entityId: number;
}
export type NewChronicleEntity = ChronicleEntity;

export type ChronicleRelation = {
  chronicleId: number;
  ancestor: number;
  orientation: ChronicleOrientation | null;
}
export type NewChronicleRelation = {
  chronicleId: number;
  ancestor: number;
  orientation?: ChronicleOrientation | null;
}

// ============ Dynamic Vita Tables ============

export type DynamicVita = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
}
export type NewDynamicVita = {
  id?: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type DynamicVitaPath = {
  dynamicVitaId: number;
  chronicleId: number;
  knots: string;
  updatedAt: Date;
}
export type NewDynamicVitaPath = {
  dynamicVitaId: number;
  chronicleId: number;
  knots?: string;
  updatedAt?: Date;
}

export type VitaShardDynamic = {
  id: number;
  vitaId: number;
  chronicleId: number;
  x: number;
  y: number;
  prevId: number | null;
  nextId: number | null;
}
export type NewVitaShardDynamic = {
  id?: number;
  vitaId: number;
  chronicleId: number;
  x: number;
  y: number;
  prevId?: number | null;
  nextId?: number | null;
}

export type SeedState = {
  key: string;
  appliedAt: Date;
}
