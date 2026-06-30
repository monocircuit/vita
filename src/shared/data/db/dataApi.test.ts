import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VitaDatabase } from './dexie';
import { createDataApi } from './dataApi';
import { ensureSeed } from './seed';
import type { Api } from './contract';

let db: VitaDatabase;
let api: Api;
let counter = 0;

beforeEach(async () => {
  db = new VitaDatabase(`test-${Date.now()}-${counter++}`);
  await db.open();
  api = createDataApi(db);
});

afterEach(async () => {
  await db.delete();
});

describe('vitas', () => {
  it('create sets createdAt (Date) and leaves updatedAt null', async () => {
    const v = await api.vitas.create({ name: 'My Vita', type: 'DYNAMIC' });
    expect(v.id).toBeTypeOf('number');
    expect(v.name).toBe('My Vita');
    expect(v.createdAt).toBeInstanceOf(Date);
    expect(v.updatedAt).toBeNull();
    expect(v.scope).toBeNull();
  });

  it('list + byId round-trip', async () => {
    const a = await api.vitas.create({ name: 'A', type: 'STATIC' });
    await api.vitas.create({ name: 'B', type: 'DYNAMIC' });
    expect(await api.vitas.list()).toHaveLength(2);
    expect((await api.vitas.byId(a.id))?.name).toBe('A');
    expect(await api.vitas.byId(9999)).toBeUndefined();
  });

  it('update stamps updatedAt and merges patch', async () => {
    const v = await api.vitas.create({ name: 'A', type: 'STATIC' });
    const updated = await api.vitas.update(v.id, { name: 'A2' });
    expect(updated.name).toBe('A2');
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.type).toBe('STATIC');
  });

  it('delete cascades to its dynamic shards', async () => {
    const v = await api.vitas.create({ name: 'A', type: 'DYNAMIC' });
    const c = await api.chronicles.create({ title: 'c', scope: 'private' });
    await api.shards.replaceForVita(v.id, [{ chronicleId: c.id, x: 1, y: 2 }]);
    expect(await api.shards.byVitaId(v.id)).toHaveLength(1);

    await api.vitas.delete(v.id);
    expect(await api.vitas.byId(v.id)).toBeUndefined();
    expect(await api.shards.byVitaId(v.id)).toHaveLength(0);
  });
});

describe('chronicles', () => {
  it('create stores knots as JSON string but returns number[]', async () => {
    const c = await api.chronicles.create({ title: 't', scope: 'public', knots: [3, 1, 2] });
    expect(c.knots).toEqual([3, 1, 2]);
    const stored = await db.chronicles.get(c.id);
    expect(stored?.knots).toBe('[3,1,2]');
  });

  it('create defaults: missing knots -> [], nullable fields null', async () => {
    const c = await api.chronicles.create({ title: 't', scope: 'private' });
    expect(c.knots).toEqual([]);
    expect(c.description).toBeNull();
    expect(c.category).toBeNull();
    expect(c.orientation).toBeNull();
    expect(c.updatedAt).toBeNull();
  });

  it('toView tolerates corrupt knots -> []', async () => {
    const id = await db.chronicles.add({
      title: 'bad',
      scope: 'private',
      knots: 'not-json',
      createdAt: new Date(),
      updatedAt: null,
    });
    expect((await api.chronicles.byId(id))?.knots).toEqual([]);
  });

  it('update re-encodes knots and stamps updatedAt', async () => {
    const c = await api.chronicles.create({ title: 't', scope: 'private', knots: [1] });
    const updated = await api.chronicles.update(c.id, { knots: [5, 6] });
    expect(updated.knots).toEqual([5, 6]);
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect((await db.chronicles.get(c.id))?.knots).toBe('[5,6]');
  });

  it('byVitaId resolves through shards; empty -> []', async () => {
    const v = await api.vitas.create({ name: 'v', type: 'DYNAMIC' });
    const c1 = await api.chronicles.create({ title: 'c1', scope: 'private' });
    const c2 = await api.chronicles.create({ title: 'c2', scope: 'private' });
    await api.chronicles.create({ title: 'c3-unlinked', scope: 'private' });

    expect(await api.chronicles.byVitaId(v.id)).toEqual([]);

    await api.shards.replaceForVita(v.id, [
      { chronicleId: c1.id, x: 0, y: 0 },
      { chronicleId: c2.id, x: 1, y: 1 },
    ]);
    const got = await api.chronicles.byVitaId(v.id);
    expect(got.map((c) => c.id).sort()).toEqual([c1.id, c2.id].sort());
  });

  it('delete cascades to entities-links, relations (both sides), paths and shards', async () => {
    const v = await api.vitas.create({ name: 'v', type: 'DYNAMIC' });
    const dv = await api.dynamicVitas.create({ name: 'dv' });
    const c = await api.chronicles.create({ title: 'c', scope: 'private' });
    const other = await api.chronicles.create({ title: 'other', scope: 'private' });
    const e = await api.entities.create({ name: 'e' });

    await api.chronicleEntities.linkMany(c.id, [e.id]);
    await api.chronicleRelations.create({ chronicleId: c.id, ancestor: other.id });
    await api.chronicleRelations.create({ chronicleId: other.id, ancestor: c.id });
    await api.dynamicVitaPaths.upsert({ dynamicVitaId: dv.id, chronicleId: c.id, knots: '[1]' });
    await api.shards.replaceForVita(v.id, [{ chronicleId: c.id, x: 0, y: 0 }]);

    await api.chronicles.delete(c.id);

    expect(await api.chronicleEntities.list()).toHaveLength(0);
    expect(await api.chronicleRelations.listByChronicleId(c.id)).toHaveLength(0);
    expect(await api.chronicleRelations.listByChronicleId(other.id)).toHaveLength(0);
    expect(await api.dynamicVitaPaths.listByDynamicVitaId(dv.id)).toHaveLength(0);
    expect(await api.shards.byVitaId(v.id)).toHaveLength(0);
  });
});

describe('chronicleEntities.linkMany', () => {
  it('is idempotent — existing links are reused, not duplicated', async () => {
    const c = await api.chronicles.create({ title: 'c', scope: 'private' });
    const e1 = await api.entities.create({ name: 'e1' });
    const e2 = await api.entities.create({ name: 'e2' });

    const first = await api.chronicleEntities.linkMany(c.id, [e1.id]);
    expect(first).toHaveLength(1);

    const second = await api.chronicleEntities.linkMany(c.id, [e1.id, e2.id]);
    expect(second).toHaveLength(2);
    expect(await api.chronicleEntities.list()).toHaveLength(2);

    expect(await api.chronicleEntities.linkMany(c.id, [])).toEqual([]);
  });

  it('unlink + unlinkAllForChronicle', async () => {
    const c = await api.chronicles.create({ title: 'c', scope: 'private' });
    const e1 = await api.entities.create({ name: 'e1' });
    const e2 = await api.entities.create({ name: 'e2' });
    await api.chronicleEntities.linkMany(c.id, [e1.id, e2.id]);

    await api.chronicleEntities.unlink(c.id, e1.id);
    expect(await api.chronicleEntities.list()).toHaveLength(1);

    await api.chronicleEntities.unlinkAllForChronicle(c.id);
    expect(await api.chronicleEntities.list()).toHaveLength(0);
  });
});

describe('shards.replaceForVita', () => {
  it('replaces all shards for a vita; empty input clears', async () => {
    const v = await api.vitas.create({ name: 'v', type: 'DYNAMIC' });
    const c1 = await api.chronicles.create({ title: 'c1', scope: 'private' });
    const c2 = await api.chronicles.create({ title: 'c2', scope: 'private' });

    const inserted = await api.shards.replaceForVita(v.id, [
      { chronicleId: c1.id, x: 1, y: 2, prevId: null, nextId: null },
      { chronicleId: c2.id, x: 3, y: 4 },
    ]);
    expect(inserted).toHaveLength(2);
    expect(inserted[0].vitaId).toBe(v.id);
    expect(inserted[1].prevId).toBeNull();

    const replaced = await api.shards.replaceForVita(v.id, [{ chronicleId: c1.id, x: 9, y: 9 }]);
    expect(replaced).toHaveLength(1);
    expect(await api.shards.byVitaId(v.id)).toHaveLength(1);

    expect(await api.shards.replaceForVita(v.id, [])).toEqual([]);
    expect(await api.shards.byVitaId(v.id)).toHaveLength(0);
  });
});

describe('dynamicVitaPaths.upsert', () => {
  it('inserts then updates the same composite key', async () => {
    const dv = await api.dynamicVitas.create({ name: 'dv' });
    const c = await api.chronicles.create({ title: 'c', scope: 'private' });

    const created = await api.dynamicVitaPaths.upsert({
      dynamicVitaId: dv.id,
      chronicleId: c.id,
      knots: '[1,2]',
    });
    expect(created.knots).toBe('[1,2]');
    expect(created.updatedAt).toBeInstanceOf(Date);

    const updated = await api.dynamicVitaPaths.upsert({
      dynamicVitaId: dv.id,
      chronicleId: c.id,
      knots: '[3]',
    });
    expect(updated.knots).toBe('[3]');
    expect(await api.dynamicVitaPaths.listByDynamicVitaId(dv.id)).toHaveLength(1);
  });
});

describe('addresses', () => {
  it('create defaults nullable fields and update merges without a timestamp column', async () => {
    const a = await api.addresses.create({ city: 'Berlin' });
    expect(a.city).toBe('Berlin');
    expect(a.street).toBeNull();
    expect(a.country).toBeNull();

    const updated = await api.addresses.update(a.id, { street: 'Main St' });
    expect(updated.street).toBe('Main St');
    expect(updated.city).toBe('Berlin');
    expect('updatedAt' in updated).toBe(false);
  });
});

describe('seed', () => {
  it('seeds continents + countries once and is idempotent', async () => {
    await ensureSeed(db);
    const continents = await api.continents.list();
    const countries = await api.countries.list();
    expect(continents).toHaveLength(7);
    expect(countries.length).toBeGreaterThan(30);
    const germany = countries.find((c) => c.isoCode === 'DE');
    expect(germany?.name).toBe('Germany');
    expect(germany?.continent).toBe(continents.find((c) => c.continent === 'Europe')?.id);

    await ensureSeed(db);
    expect(await api.continents.list()).toHaveLength(7);
    expect((await api.countries.list()).length).toBe(countries.length);
  });
});
