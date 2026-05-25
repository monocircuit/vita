import { ipcMain } from 'electron';
import { getDb } from '../db/client';
import { countries, continents } from '../db/schema';

export function registerLocationHandlers(): void {
  ipcMain.handle('countries:list', () => {
    return getDb().select().from(countries).all();
  });

  ipcMain.handle('continents:list', () => {
    return getDb().select().from(continents).all();
  });
}
