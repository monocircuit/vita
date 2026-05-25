import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { addresses } from '../db/schema';
import type { AddressPatch } from './contracts';

export function registerAddressHandlers(): void {
  ipcMain.handle('addresses:list', () => {
    return getDb().select().from(addresses).all();
  });

  ipcMain.handle('addresses:create', (_event, input) => {
    return getDb().insert(addresses).values(input).returning().get();
  });

  ipcMain.handle('addresses:update', (_event, id: number, patch: AddressPatch) => {
    return getDb()
      .update(addresses)
      .set(patch)
      .where(eq(addresses.id, id))
      .returning()
      .get();
  });
}
