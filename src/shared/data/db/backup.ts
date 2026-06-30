// Manual backup: export the whole local database to a JSON file and restore it.
// Since all data lives only in this browser, this is the user's path to a
// backup and to moving data between browsers/devices.
//
// `Date` values are preserved exactly through a tagged JSON encoding so that
// restored timestamps remain real `Date` objects (matching what the data layer
// produces).

import { STORE_NAMES, type VitaDatabase } from './dexie';

export const BACKUP_FORMAT_VERSION = 1;

interface DateTag {
  __t: 'date';
  v: number;
}

function isDateTag(value: unknown): value is DateTag {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as DateTag).__t === 'date' &&
    typeof (value as DateTag).v === 'number'
  );
}

// `this[key]` is the raw value before Date#toJSON runs, so we can detect Dates.
function replacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key];
  if (raw instanceof Date) return { __t: 'date', v: raw.getTime() } satisfies DateTag;
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (isDateTag(value)) return new Date(value.v);
  return value;
}

export interface BackupFile {
  formatVersion: number;
  exportedAt: Date;
  schemaVersion: number;
  tables: Record<string, unknown[]>;
}

/** Serialize the entire database to a JSON string. */
export async function buildBackup(db: VitaDatabase): Promise<string> {
  const tables: Record<string, unknown[]> = {};
  await db.transaction('r', db.tables, async () => {
    for (const name of STORE_NAMES) {
      tables[name] = await db.table(name).toArray();
    }
  });
  const payload: BackupFile = {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date(),
    schemaVersion: db.verno,
    tables,
  };
  return JSON.stringify(payload, replacer, 2);
}

/** Parse + validate a backup JSON string. Throws on incompatible input. */
export function parseBackup(json: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(json, reviver);
  } catch {
    throw new Error('Die Datei ist keine gültige Backup-Datei (kein JSON).');
  }
  if (
    !data ||
    typeof data !== 'object' ||
    (data as BackupFile).formatVersion !== BACKUP_FORMAT_VERSION ||
    typeof (data as BackupFile).tables !== 'object'
  ) {
    throw new Error('Ungültige oder inkompatible Backup-Datei.');
  }
  return data as BackupFile;
}

/**
 * Replace ALL local data with the contents of a backup. Existing data is
 * cleared first; keys (incl. auto-increment ids and compound keys) are
 * preserved so cross-table references stay intact.
 */
export async function importBackup(db: VitaDatabase, json: string): Promise<void> {
  const data = parseBackup(json);
  await db.transaction('rw', db.tables, async () => {
    for (const name of STORE_NAMES) {
      const table = db.table(name);
      await table.clear();
      const rows = data.tables[name];
      if (Array.isArray(rows) && rows.length > 0) {
        await table.bulkPut(rows);
      }
    }
  });
}

/** Build a backup and trigger a browser download. */
export async function downloadBackup(db: VitaDatabase): Promise<void> {
  const json = await buildBackup(db);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vita-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
