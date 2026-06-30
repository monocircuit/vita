export * from './types';
export * from './contract';
export { VitaDatabase, db, STORE_NAMES, type StoreName } from './dexie';
export { ensureSeed } from './seed';
export { createDataApi } from './dataApi';

import { createDataApi } from './dataApi';
import { db } from './dexie';

/** The app-wide data-access object, backed by the singleton IndexedDB database. */
export const dataApi = createDataApi(db);
