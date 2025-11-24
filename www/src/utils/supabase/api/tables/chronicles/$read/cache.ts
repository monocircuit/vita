import { oTChronicle } from "../_mapping";
import { normalizeChronicle } from "./normalization";

/**
 * @author ChatGPT5
 *
 * Structure of the normalized base store:
 * - `byId`: entity map (id -> Chronicle)
 * - `allIds`: order of all known IDs
 * - `index`: precomputed indexes (byUser, byType) for O(k) lookups
 * - `loaded`: markers indicating which scopes have been fully loaded
 */
export interface IChronicleCache {
  byId: Record<string | number, oTChronicle>;
  allIds: Array<string | number>;
  index: {
    byUser: Record<string, Array<string | number>>;
    byType: Record<string, Array<string | number>>;
  };
  loaded: {
    all: boolean;
    users: Set<string>;
    types: Set<string>;
  };
}

/**
 * @author ChatGPT5
 *
 * Creates an empty cache with all fields initialized.
 */
export const emptyCache = (): IChronicleCache => ({
  byId: {},
  allIds: [],
  index: { byUser: {}, byType: {} },
  loaded: { all: false, users: new Set(), types: new Set() },
});

/**
 * @author ChatGPT5
 *
 * Merge function: normalizes rows into the cache, maintains indexes,
 * and optionally marks certain scopes as fully loaded.
 */
export function mergeIntoCache(
  cache: IChronicleCache,
  rows: any[],
  mark?: { all?: boolean; userId?: string; type?: string },
) {
  console.log("rows", rows);
  for (const raw of rows) {
    const r = normalizeChronicle(raw);
    const id = r.id as unknown as string | number;

    const exists = cache.byId[id];
    cache.byId[id] = r;
    if (!exists) cache.allIds.push(id);

    // byUser index
    const uid = (r as any).user_id as string | undefined;
    if (uid) {
      if (!cache.index.byUser[uid]) cache.index.byUser[uid] = [];
      if (!cache.index.byUser[uid].includes(id)) {
        cache.index.byUser[uid].push(id);
      }
    }

    // byType index (optional)
    const t = String((r as any).type ?? "");
    if (t) {
      if (!cache.index.byType[t]) cache.index.byType[t] = [];
      if (!cache.index.byType[t].includes(id)) {
        cache.index.byType[t].push(id);
      }
    }
  }

  if (mark?.all) cache.loaded.all = true;
  if (mark?.userId) cache.loaded.users.add(mark.userId);
  if (mark?.type) cache.loaded.types.add(mark.type);
}
