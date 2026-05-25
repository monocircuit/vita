import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { vitasShardsDynamic } from '../db/schema';
import type { ShardReplaceInput } from './contracts';

export function registerShardHandlers(): void {
  ipcMain.handle('shards:byVitaId', (_event, vitaId: number) => {
    return getDb()
      .select()
      .from(vitasShardsDynamic)
      .where(eq(vitasShardsDynamic.vitaId, vitaId))
      .all();
  });

  ipcMain.handle('shards:replaceForVita', (_event, vitaId: number, shards: ShardReplaceInput) => {
    const db = getDb();
    return db.transaction((tx) => {
      tx.delete(vitasShardsDynamic).where(eq(vitasShardsDynamic.vitaId, vitaId)).run();
      if (shards.length === 0) return [];
      const inserted = shards.map(shard =>
        tx.insert(vitasShardsDynamic)
          .values({ ...shard, vitaId })
          .returning()
          .get()
      );
      return inserted;
    });
  });
}
