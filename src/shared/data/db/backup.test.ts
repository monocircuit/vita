import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VitaDatabase } from './dexie';
import { createDataApi } from './dataApi';
import { ensureSeed } from './seed';
import { buildBackup, importBackup, parseBackup } from './backup';
import type { Api } from './contract';

let db: VitaDatabase;
let api: Api;
let counter = 0;

beforeEach(async () => {
  db = new VitaDatabase(`bk-${Date.now()}-${counter++}`);
  await db.open();
  api = createDataApi(db);
});

afterEach(async () => {
  await db.delete();
});

describe('backup round-trip', () => {
  it('export -> fresh db -> import reproduces data, ids and Date types', async () => {
    await ensureSeed(db);
    const v = await api.vitas.create({ name: 'V', type: 'DYNAMIC' });
    const c = await api.chronicles.create({ title: 'C', scope: 'private', knots: [1, 2, 3] });
    await api.shards.replaceForVita(v.id, [{ chronicleId: c.id, x: 5, y: 6 }]);

    const json = await buildBackup(db);

    const fresh = new VitaDatabase(`bk-fresh-${Date.now()}-${counter++}`);
    await fresh.open();
    const freshApi = createDataApi(fresh);
    try {
      await importBackup(fresh, json);

      const vitas = await freshApi.vitas.list();
      expect(vitas).toHaveLength(1);
      expect(vitas[0].id).toBe(v.id);
      expect(vitas[0].createdAt).toBeInstanceOf(Date);

      const chronicles = await freshApi.chronicles.list();
      expect(chronicles[0].knots).toEqual([1, 2, 3]);

      const shards = await freshApi.shards.byVitaId(v.id);
      expect(shards).toHaveLength(1);
      expect(shards[0].chronicleId).toBe(c.id);

      // seeded reference data survives too
      expect(await freshApi.continents.list()).toHaveLength(7);
    } finally {
      await fresh.delete();
    }
  });

  it('import replaces existing data', async () => {
    const json = await buildBackup(db); // empty backup
    await api.vitas.create({ name: 'will-be-wiped', type: 'STATIC' });
    expect(await api.vitas.list()).toHaveLength(1);

    await importBackup(db, json);
    expect(await api.vitas.list()).toHaveLength(0);
  });

  it('parseBackup rejects incompatible files', () => {
    expect(() => parseBackup('not json')).toThrow();
    expect(() => parseBackup(JSON.stringify({ formatVersion: 999, tables: {} }))).toThrow();
  });
});
