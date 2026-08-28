// Browser data-access layer. Implements the `Api` contract against Dexie,
// reproducing every former `electron/ipc/*` handler 1:1 (see the design spec
// section "Handler-für-Handler"). Behaviour — including null defaulting,
// `updatedAt` stamping, `knots` (string <-> number[]) conversion, transactional
// upserts and the manual cascade deletes that replace SQLite's ON DELETE
// CASCADE — must stay identical to the original app.

import type { VitaDatabase } from './dexie';
import type { Api, ChronicleView } from './contract';
import type { Chronicle } from './types';

function toView(row: Chronicle): ChronicleView {
  let parsed: number[];
  try {
    const candidate = JSON.parse(row.knots ?? '[]');
    parsed = Array.isArray(candidate)
      ? candidate.map(Number).filter((n) => Number.isFinite(n))
      : [];
  } catch {
    parsed = [];
  }
  return { ...row, knots: parsed };
}

export function createDataApi(db: VitaDatabase): Api {
  return {
    // ---------------------------------------------------------------- vitas
    vitas: {
      list: () => db.vitas.toArray(),
      byId: (id) => db.vitas.get(id),
      create: async (input) => {
        const id = await db.vitas.add({
          ...input,
          createdAt: new Date(),
          updatedAt: null,
        });
        return (await db.vitas.get(id))!;
      },
      update: async (id, patch) => {
        await db.vitas.update(id, { ...patch, updatedAt: new Date() });
        return (await db.vitas.get(id))!;
      },
      delete: async (id) => {
        await db.transaction('rw', db.vitas, db.vitasShardsDynamic, async () => {
          await db.vitasShardsDynamic.where('vitaId').equals(id).delete();
          await db.vitas.delete(id);
        });
      },
    },

    // ----------------------------------------------------------- chronicles
    chronicles: {
      list: async () => (await db.chronicles.toArray()).map(toView),
      byId: async (id) => {
        const row = await db.chronicles.get(id);
        return row ? toView(row) : undefined;
      },
      byVitaId: async (vitaId) => {
        const shardChronicleIds = (
          await db.vitasShardsDynamic.where('vitaId').equals(vitaId).toArray()
        ).map((r) => r.chronicleId);
        if (shardChronicleIds.length === 0) return [];
        const rows = await db.chronicles.where('id').anyOf(shardChronicleIds).toArray();
        return rows.map(toView);
      },
      create: async (input) => {
        const id = await db.chronicles.add({
          title: input.title,
          description: input.description ?? null,
          category: input.category ?? null,
          orientation: input.orientation ?? null,
          scope: input.scope,
          knots: JSON.stringify(input.knots ?? []),
          createdAt: new Date(),
          updatedAt: null,
        });
        return toView((await db.chronicles.get(id))!);
      },
      update: async (id, patch) => {
        const updatePayload: Record<string, unknown> = { ...patch, updatedAt: new Date() };
        if (patch.knots !== undefined) {
          updatePayload.knots = JSON.stringify(patch.knots);
        }
        await db.chronicles.update(id, updatePayload as Partial<Chronicle>);
        return toView((await db.chronicles.get(id))!);
      },
      delete: async (id) => {
        await db.transaction(
          'rw',
          db.chronicles,
          db.chronicleEntities,
          db.chronicleRelations,
          db.dynamicVitaPaths,
          db.vitasShardsDynamic,
          async () => {
            await db.chronicleEntities.where('chronicleId').equals(id).delete();
            await db.chronicleRelations.where('chronicleId').equals(id).delete();
            await db.chronicleRelations.where('ancestor').equals(id).delete();
            await db.dynamicVitaPaths.where('chronicleId').equals(id).delete();
            await db.vitasShardsDynamic.where('chronicleId').equals(id).delete();
            await db.chronicles.delete(id);
          },
        );
      },
    },

    // ------------------------------------------------------------- entities
    entities: {
      list: () => db.entities.toArray(),
      byId: (id) => db.entities.get(id),
      create: async (input) => {
        const id = await db.entities.add({
          ...input,
          address: input.address ?? null,
          createdAt: new Date(),
          updatedAt: null,
        });
        return (await db.entities.get(id))!;
      },
      update: async (id, patch) => {
        await db.entities.update(id, { ...patch, updatedAt: new Date() });
        return (await db.entities.get(id))!;
      },
      delete: async (id) => {
        await db.transaction('rw', db.entities, db.chronicleEntities, async () => {
          await db.chronicleEntities.where('entityId').equals(id).delete();
          await db.entities.delete(id);
        });
      },
    },

    // ----------------------------------------------------- chronicleEntities
    chronicleEntities: {
      list: () => db.chronicleEntities.toArray(),
      linkMany: async (chronicleId, entityIds) => {
        if (entityIds.length === 0) return [];
        return db.transaction('rw', db.chronicleEntities, async () => {
          const created: { chronicleId: number; entityId: number }[] = [];
          for (const entityId of entityIds) {
            const existing = await db.chronicleEntities.get([chronicleId, entityId]);
            if (existing) {
              created.push(existing);
              continue;
            }
            await db.chronicleEntities.add({ chronicleId, entityId });
            created.push({ chronicleId, entityId });
          }
          return created;
        });
      },
      unlink: async (chronicleId, entityId) => {
        await db.chronicleEntities.delete([chronicleId, entityId]);
      },
      unlinkAllForChronicle: async (chronicleId) => {
        await db.chronicleEntities.where('chronicleId').equals(chronicleId).delete();
      },
    },

    // ---------------------------------------------------- chronicleRelations
    chronicleRelations: {
      listByChronicleId: (chronicleId) =>
        db.chronicleRelations.where('chronicleId').equals(chronicleId).toArray(),
      create: async (input) => {
        await db.chronicleRelations.add({
          chronicleId: input.chronicleId,
          ancestor: input.ancestor,
          orientation: input.orientation ?? null,
        });
        return (await db.chronicleRelations.get([input.chronicleId, input.ancestor]))!;
      },
      delete: async (chronicleId, ancestor) => {
        await db.chronicleRelations.delete([chronicleId, ancestor]);
      },
    },

    // --------------------------------------------------------- dynamicVitas
    dynamicVitas: {
      list: () => db.dynamicVitas.toArray(),
      create: async (input) => {
        const id = await db.dynamicVitas.add({
          ...input,
          createdAt: new Date(),
          updatedAt: null,
        });
        return (await db.dynamicVitas.get(id))!;
      },
      update: async (id, patch) => {
        await db.dynamicVitas.update(id, { ...patch, updatedAt: new Date() });
        return (await db.dynamicVitas.get(id))!;
      },
      delete: async (id) => {
        await db.transaction('rw', db.dynamicVitas, db.dynamicVitaPaths, async () => {
          await db.dynamicVitaPaths.where('dynamicVitaId').equals(id).delete();
          await db.dynamicVitas.delete(id);
        });
      },
    },

    // ----------------------------------------------------- dynamicVitaPaths
    dynamicVitaPaths: {
      listByDynamicVitaId: (dynamicVitaId) =>
        db.dynamicVitaPaths.where('dynamicVitaId').equals(dynamicVitaId).toArray(),
      upsert: async (input) => {
        return db.transaction('rw', db.dynamicVitaPaths, async () => {
          const knotsStr =
            typeof input.knots === 'string'
              ? input.knots
              : JSON.stringify(input.knots ?? []);
          const key: [number, number] = [input.dynamicVitaId, input.chronicleId];
          const existing = await db.dynamicVitaPaths.get(key);
          if (existing) {
            await db.dynamicVitaPaths.update(key, { knots: knotsStr, updatedAt: new Date() });
            return (await db.dynamicVitaPaths.get(key))!;
          }
          await db.dynamicVitaPaths.add({ ...input, knots: knotsStr, updatedAt: new Date() });
          return (await db.dynamicVitaPaths.get(key))!;
        });
      },
      delete: async (dynamicVitaId, chronicleId) => {
        await db.dynamicVitaPaths.delete([dynamicVitaId, chronicleId]);
      },
    },

    // ----------------------------------------------------------- shards
    shards: {
      byVitaId: (vitaId) => db.vitasShardsDynamic.where('vitaId').equals(vitaId).toArray(),
      replaceForVita: async (vitaId, shards) => {
        return db.transaction('rw', db.vitasShardsDynamic, async () => {
          await db.vitasShardsDynamic.where('vitaId').equals(vitaId).delete();
          if (shards.length === 0) return [];
          const inserted = [];
          for (const shard of shards) {
            const id = await db.vitasShardsDynamic.add({
              ...shard,
              vitaId,
              prevId: shard.prevId ?? null,
              nextId: shard.nextId ?? null,
            });
            inserted.push((await db.vitasShardsDynamic.get(id))!);
          }
          return inserted;
        });
      },
    },

    // ------------------------------------------------------------ addresses
    addresses: {
      list: () => db.addresses.toArray(),
      create: async (input) => {
        const id = await db.addresses.add({
          street: input.street ?? null,
          city: input.city ?? null,
          postalCode: input.postalCode ?? null,
          country: input.country ?? null,
        });
        return (await db.addresses.get(id))!;
      },
      update: async (id, patch) => {
        // NOTE: addresses has no updatedAt column — the original handler does
        // not stamp a timestamp here.
        await db.addresses.update(id, patch);
        return (await db.addresses.get(id))!;
      },
    },

    // ----------------------------------------------------- countries / continents
    countries: {
      list: () => db.countries.toArray(),
    },
    continents: {
      list: () => db.continents.toArray(),
    },
  };
}
