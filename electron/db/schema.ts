import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';

// ============ Enums (as TS unions, stored as TEXT) ============

export const scopeValues = ['private', 'public', 'restricted'] as const;
export type Scope = typeof scopeValues[number];

export const vitaTypeValues = ['DYNAMIC', 'STATIC'] as const;
export type VitaType = typeof vitaTypeValues[number];

export const chronicleCategoryValues = [
  'work experience',
  'education',
  'internship',
  'volunteering',
  'hobby',
] as const;
export type ChronicleCategory = typeof chronicleCategoryValues[number];

export const chronicleOrientationValues = ['above', 'below', 'neutral'] as const;
export type ChronicleOrientation = typeof chronicleOrientationValues[number];

export const maritalStatusValues = [
  'single',
  'married',
  'divorced',
  'widowed',
  'separated',
  'partnered',
] as const;
export type MaritalStatus = typeof maritalStatusValues[number];

// ============ Reference Tables ============

export const continents = sqliteTable('continents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  continent: text('continent').notNull(),
});

export const countries = sqliteTable('countries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isoCode: text('iso_code').notNull().unique(),
  name: text('name').notNull(),
  continent: integer('continent').references(() => continents.id),
});

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  street: text('street'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: integer('country').references(() => countries.id),
});

// ============ User-scoped Tables (user_id removed — single user) ============

export const vitas = sqliteTable('vitas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: vitaTypeValues }).notNull(),
  scope: text('scope', { enum: scopeValues }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export const chronicles = sqliteTable('chronicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: chronicleCategoryValues }),
  orientation: text('orientation', { enum: chronicleOrientationValues }),
  scope: text('scope', { enum: scopeValues }).notNull(),
  knots: text('knots').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export const entities = sqliteTable('entities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: integer('address').references(() => addresses.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export const chronicleEntities = sqliteTable('chronicle_entities', {
  chronicleId: integer('chronicle_id').notNull().references(() => chronicles.id, { onDelete: 'cascade' }),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.chronicleId, table.entityId] }),
}));

export const chronicleRelations = sqliteTable('chronicle_relations', {
  chronicleId: integer('chronicle_id').notNull().references(() => chronicles.id, { onDelete: 'cascade' }),
  ancestor: integer('ancestor').notNull().references(() => chronicles.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.chronicleId, table.ancestor] }),
}));

// ============ Dynamic Vita Tables ============

export const dynamicVitas = sqliteTable('dynamic_vitas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export const dynamicVitaPaths = sqliteTable('dynamic_vita_paths', {
  dynamicVitaId: integer('dynamic_vita_id').notNull().references(() => dynamicVitas.id, { onDelete: 'cascade' }),
  chronicleId: integer('chronicle_id').notNull().references(() => chronicles.id, { onDelete: 'cascade' }),
  knots: text('knots').notNull().default('[]'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.dynamicVitaId, table.chronicleId] }),
}));

export const vitasShardsDynamic = sqliteTable('vitas_shards_dynamic', {
  vitaId: integer('vita_id').notNull().references(() => vitas.id, { onDelete: 'cascade' }),
  chronicleId: integer('chronicle_id').notNull().references(() => chronicles.id, { onDelete: 'cascade' }),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  prevId: integer('prev_id'),
  nextId: integer('next_id'),
}, (table) => ({
  pk: primaryKey({ columns: [table.vitaId, table.chronicleId] }),
}));

// ============ Type-Exports ============

export type Vita = typeof vitas.$inferSelect;
export type NewVita = typeof vitas.$inferInsert;
export type Chronicle = typeof chronicles.$inferSelect;
export type NewChronicle = typeof chronicles.$inferInsert;
export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
