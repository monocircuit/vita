import { ipcMain } from 'electron';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { dynamicVitaPaths } from '../db/schema';
import type { NewDynamicVitaPath } from '../db/schema';

export function registerDynamicVitaPathHandlers(): void {
  ipcMain.handle('dynamicVitaPaths:listByDynamicVitaId', (_event, dynamicVitaId: number) => {
    return getDb()
      .select()
      .from(dynamicVitaPaths)
      .where(eq(dynamicVitaPaths.dynamicVitaId, dynamicVitaId))
      .all();
  });

  ipcMain.handle('dynamicVitaPaths:upsert', (_event, input: NewDynamicVitaPath) => {
    const db = getDb();
    return db.transaction((tx) => {
      const knotsStr = typeof input.knots === 'string' ? input.knots : JSON.stringify(input.knots ?? []);
      const existing = tx
        .select()
        .from(dynamicVitaPaths)
        .where(and(
          eq(dynamicVitaPaths.dynamicVitaId, input.dynamicVitaId),
          eq(dynamicVitaPaths.chronicleId, input.chronicleId),
        ))
        .get();

      if (existing) {
        return tx
          .update(dynamicVitaPaths)
          .set({ knots: knotsStr, updatedAt: new Date() })
          .where(and(
            eq(dynamicVitaPaths.dynamicVitaId, input.dynamicVitaId),
            eq(dynamicVitaPaths.chronicleId, input.chronicleId),
          ))
          .returning()
          .get();
      }
      return tx
        .insert(dynamicVitaPaths)
        .values({ ...input, knots: knotsStr })
        .returning()
        .get();
    });
  });

  ipcMain.handle('dynamicVitaPaths:delete', (_event, dynamicVitaId: number, chronicleId: number) => {
    getDb()
      .delete(dynamicVitaPaths)
      .where(and(
        eq(dynamicVitaPaths.dynamicVitaId, dynamicVitaId),
        eq(dynamicVitaPaths.chronicleId, chronicleId),
      ))
      .run();
  });
}
