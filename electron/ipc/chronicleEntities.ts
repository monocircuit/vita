import { ipcMain } from 'electron';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { chronicleEntities } from '../db/schema';

export function registerChronicleEntityHandlers(): void {
  ipcMain.handle('chronicleEntities:list', () => {
    return getDb().select().from(chronicleEntities).all();
  });

  ipcMain.handle('chronicleEntities:linkMany', (_event, chronicleId: number, entityIds: number[]) => {
    if (entityIds.length === 0) return [];
    const db = getDb();
    return db.transaction((tx) => {
      const created: { chronicleId: number; entityId: number }[] = [];
      for (const entityId of entityIds) {
        const existing = tx
          .select()
          .from(chronicleEntities)
          .where(and(
            eq(chronicleEntities.chronicleId, chronicleId),
            eq(chronicleEntities.entityId, entityId),
          ))
          .get();
        if (existing) {
          created.push(existing);
          continue;
        }
        const row = tx
          .insert(chronicleEntities)
          .values({ chronicleId, entityId })
          .returning()
          .get();
        created.push(row);
      }
      return created;
    });
  });

  ipcMain.handle('chronicleEntities:unlink', (_event, chronicleId: number, entityId: number) => {
    getDb()
      .delete(chronicleEntities)
      .where(and(
        eq(chronicleEntities.chronicleId, chronicleId),
        eq(chronicleEntities.entityId, entityId),
      ))
      .run();
  });

  ipcMain.handle('chronicleEntities:unlinkAllForChronicle', (_event, chronicleId: number) => {
    getDb()
      .delete(chronicleEntities)
      .where(eq(chronicleEntities.chronicleId, chronicleId))
      .run();
  });
}
