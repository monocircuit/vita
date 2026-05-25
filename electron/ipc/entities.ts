import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { entities } from '../db/schema';
import type { EntityPatch } from './contracts';

export function registerEntityHandlers(): void {
  ipcMain.handle('entities:list', () => {
    return getDb().select().from(entities).all();
  });

  ipcMain.handle('entities:byId', (_event, id: number) => {
    return getDb().select().from(entities).where(eq(entities.id, id)).get();
  });

  ipcMain.handle('entities:create', (_event, input) => {
    return getDb().insert(entities).values(input).returning().get();
  });

  ipcMain.handle('entities:update', (_event, id: number, patch: EntityPatch) => {
    return getDb()
      .update(entities)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(entities.id, id))
      .returning()
      .get();
  });

  ipcMain.handle('entities:delete', (_event, id: number) => {
    getDb().delete(entities).where(eq(entities.id, id)).run();
  });
}
