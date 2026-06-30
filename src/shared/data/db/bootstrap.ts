import { db } from './dexie';
import { ensureSeed } from './seed';

/**
 * Prepare the local database before the app renders:
 *  1. open the IndexedDB connection (runs any Dexie schema upgrades)
 *  2. seed reference data (continents/countries) on first run
 *  3. best-effort request persistent storage so the browser does not evict
 *     the user's data under storage pressure
 *
 * Must resolve before the first data read so seeded reference data is present.
 */
export async function initLocalDb(): Promise<void> {
  await db.open();
  await ensureSeed(db);

  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Persistence is an optimization, not a requirement — ignore failures.
  }
}
