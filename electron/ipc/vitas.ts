import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { vitas } from '../db/schema';
import type { VitaPatch } from './contracts';

export function registerVitaHandlers(): void {
  ipcMain.handle('vitas:list', () => {
    return getDb().select().from(vitas).all();
  });

  ipcMain.handle('vitas:byId', (_event, id: number) => {
    return getDb().select().from(vitas).where(eq(vitas.id, id)).get();
  });

  ipcMain.handle('vitas:create', (_event, input) => {
    return getDb().insert(vitas).values(input).returning().get();
  });

  ipcMain.handle('vitas:update', (_event, id: number, patch: VitaPatch) => {
    return getDb()
      .update(vitas)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(vitas.id, id))
      .returning()
      .get();
  });

  ipcMain.handle('vitas:delete', (_event, id: number) => {
    getDb().delete(vitas).where(eq(vitas.id, id)).run();
  });
}
