import { ipcMain } from 'electron';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { chronicleRelations } from '../db/schema';
import type { NewChronicleRelation } from '../db/schema';

export function registerChronicleRelationHandlers(): void {
  ipcMain.handle('chronicleRelations:listByChronicleId', (_event, chronicleId: number) => {
    return getDb()
      .select()
      .from(chronicleRelations)
      .where(eq(chronicleRelations.chronicleId, chronicleId))
      .all();
  });

  ipcMain.handle('chronicleRelations:create', (_event, input: NewChronicleRelation) => {
    return getDb().insert(chronicleRelations).values(input).returning().get();
  });

  ipcMain.handle('chronicleRelations:delete', (_event, chronicleId: number, ancestor: number) => {
    getDb()
      .delete(chronicleRelations)
      .where(and(
        eq(chronicleRelations.chronicleId, chronicleId),
        eq(chronicleRelations.ancestor, ancestor),
      ))
      .run();
  });
}
