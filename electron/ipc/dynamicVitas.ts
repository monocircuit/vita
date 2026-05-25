import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { dynamicVitas } from '../db/schema';

export function registerDynamicVitaHandlers(): void {
  ipcMain.handle('dynamicVitas:list', () => {
    return getDb().select().from(dynamicVitas).all();
  });

  ipcMain.handle('dynamicVitas:create', (_event, input) => {
    return getDb().insert(dynamicVitas).values(input).returning().get();
  });

  ipcMain.handle('dynamicVitas:update', (_event, id: number, patch) => {
    return getDb()
      .update(dynamicVitas)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(dynamicVitas.id, id))
      .returning()
      .get();
  });

  ipcMain.handle('dynamicVitas:delete', (_event, id: number) => {
    getDb().delete(dynamicVitas).where(eq(dynamicVitas.id, id)).run();
  });
}
