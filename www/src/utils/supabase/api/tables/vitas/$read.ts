import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { oTVita } from "@/utils/supabase/api/tables/vitas/mapping";

/* --------------------------------- Keys --------------------------------- */
/**
 * @author ChatGPT5
 *
 * Shared cache key under which the **normalized base store** is stored.
 * All views (all/own/byUser/byType/byName) eventually read from this cache.
 */
export const vitaBaseKey = ["vitas"] as const;

/**
 * @author ChatGPT5
 *
 * Internal “network keys”, used only to track each network fetch.
 * Results are **always** merged into the base store (`vitaBaseKey`).
 */
const netKey = {
  all: () => ["vitas", "net", "all"] as const,
  byUser: (userId: string) => ["vitas", "net", "byUser", userId] as const,
  byType: (type: string) => ["vitas", "net", "byType", String(type)] as const,
  byName: (name: string) => ["vitas", "net", "byName", name] as const,
  own: () => ["vitas", "net", "own"] as const,
};

/* ------------------------------ Base Cache ------------------------------ */

/**
 * @author ChatGPT5
 *
 * Structure of the normalized base store:
 * - `byId`: entity map (id -> Vita)
 * - `allIds`: order of all known IDs
 * - `index`: precomputed indexes (byUser, byType) for O(k) lookups
 * - `loaded`: markers indicating which scopes have been fully loaded
 */
export interface IVitaCache {
  byId: Record<string | number, oTVita>;
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
const emptyCache = (): IVitaCache => ({
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
 *
 * @param cache - existing cache (mutated in-place)
 * @param rows - new/updated vita rows
 * @param mark - optional flags indicating what scope was fully loaded
 */
function mergeIntoCache(
  cache: IVitaCache,
  rows: oTVita[],
  mark?: { all?: boolean; userId?: string; type?: string },
) {
  for (const r of rows) {
    const id = r.id as unknown as string | number;
    const exists = cache.byId[id];
    cache.byId[id] = r;
    if (!exists) cache.allIds.push(id);

    // byUser index
    const uid = r.user_id;
    if (uid) {
      if (!cache.index.byUser[uid]) cache.index.byUser[uid] = [];
      if (!cache.index.byUser[uid].includes(id)) {
        cache.index.byUser[uid].push(id);
      }
    }

    // byType index
    const t = String(r.type ?? "");
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

/* ------------------------------ Fetchers ------------------------------- */

const supa = () => createClient();

/**
 * @author ChatGPT5
 *
 * Fetch all vitas from Supabase.
 */
async function fetchAll(): Promise<oTVita[]> {
  const { data, error } = await supa().from("vitas").select("*");
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch vitas for a specific `user_id`.
 */
async function fetchByUser(userId: string): Promise<oTVita[]> {
  const { data, error } = await supa()
    .from("vitas")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch vitas for the **currently authenticated user**.
 * Returns both `userId` and `vitas`.
 */
async function fetchOwn(): Promise<{ userId: string | null; vitas: oTVita[] }> {
  const { data: ures, error: uerr } = await supa().auth.getUser();
  if (uerr) throw uerr;
  const userId = ures.user?.id ?? null;
  if (!userId) return { userId: null, vitas: [] };
  const vitas = await fetchByUser(userId);
  return { userId, vitas };
}

/**
 * @author ChatGPT5
 *
 * Fetch vitas by a given `type`.
 */
async function fetchByType(type: string): Promise<oTVita[]> {
  const { data, error } = await supa()
    .from("vitas")
    .select("*")
    .eq("type", type);
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch vitas whose `name` contains the given term (case-insensitive).
 */
async function fetchByNameContains(name: string): Promise<oTVita[]> {
  const { data, error } = await supa()
    .from("vitas")
    .select("*")
    .ilike("name", `%${name}%`);
  if (error) throw error;
  return data ?? [];
}

/* ---------------------------- Base Query Hook --------------------------- */

/**
 * @author ChatGPT5
 *
 * Hook for reactive access to the **shared base store**:
 * - `queryFn` is synchronous: it reads the current cache from QueryClient
 * - network fetches are separate queries (`netKey.*`) and merge their results
 *   into this cache using `setQueryData`
 * - `select` defines the view to compute from the cache (e.g. all, byUser)
 */
function useVitaBase<T = oTVita[]>(
  select: (cache: IVitaCache) => T,
  opts?: { enabled?: boolean; staleTime?: number },
) {
  const qc = useQueryClient();

  const q = useQuery<IVitaCache, Error, T, typeof vitaBaseKey>({
    queryKey: vitaBaseKey,
    queryFn: () => qc.getQueryData<IVitaCache>(vitaBaseKey) ?? emptyCache(),
    initialData: emptyCache(),
    staleTime: opts?.staleTime ?? Infinity,
    enabled: opts?.enabled ?? true,
    select,
  });

  return {
    vitas: (q.data as T) ?? ([] as unknown as T),
    loading: q.isLoading,
    error: (q.error as Error) ?? null,
    refetch: q.refetch,
  };
}

/* --------------------------- Public Read Hooks -------------------------- */

/**
 * @author ChatGPT5
 *
 * Load (if necessary) **all** vitas and return them from the base store.
 * The network fetch is tracked separately and its results are merged into the store.
 */
export function useReadAllVitas() {
  const qc = useQueryClient();
  const { data: rows } = useQuery<oTVita[]>({
    queryKey: netKey.all(),
    queryFn: fetchAll,
  });

  useEffect(() => {
    if (!rows) return;
    qc.setQueryData<IVitaCache>(vitaBaseKey, old => {
      const next = old
        ? {
            ...old,
            loaded: {
              ...old.loaded,
              users: new Set(old.loaded.users),
              types: new Set(old.loaded.types),
            },
          }
        : emptyCache();
      mergeIntoCache(next, rows, { all: true });
      return next;
    });
  }, [rows, qc]);

  return useVitaBase(cache => cache.allIds.map(id => cache.byId[id]));
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) only the **current user's** vitas and return them from the base store.
 */
export function useReadOwnVitas() {
  const qc = useQueryClient();
  const { data } = useQuery<{ userId: string | null; vitas: oTVita[] }>({
    queryKey: netKey.own(),
    queryFn: fetchOwn,
  });

  useEffect(() => {
    if (!data?.userId) return;
    qc.setQueryData<IVitaCache>(vitaBaseKey, old => {
      const next = old
        ? {
            ...old,
            loaded: {
              ...old.loaded,
              users: new Set(old.loaded.users),
              types: new Set(old.loaded.types),
            },
          }
        : emptyCache();
      mergeIntoCache(next, data.vitas, { userId: data.userId ?? undefined });
      return next;
    });
  }, [data, qc]);

  return useVitaBase(cache => {
    const ids = Array.from(cache.loaded.users).flatMap(
      uid => cache.index.byUser[uid] ?? [],
    );
    const uniq = Array.from(new Set(ids));
    return uniq.map(id => cache.byId[id]);
  });
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) vitas for a specific `userId` and return them from the base store.
 *
 * @param userId - Target user ID.
 *
 * Why `string | undefined`?
 * - This allows you to mount the hook even if the userId is not yet available
 *   (e.g. coming from props, router params, or context).
 * - If `userId` is `undefined`, the query is disabled (`enabled: false`) and
 *   returns an empty list instead of throwing.
 *
 * If your application guarantees that `userId` is always defined, you can
 * change the signature to just `string` and handle the `undefined` case in
 * your component instead.
 */
export function useReadVitasByUser(userId?: string) {
  const qc = useQueryClient();
  const { data: rows } = useQuery<oTVita[]>({
    queryKey: userId ? netKey.byUser(userId) : ["noop"],
    queryFn: () => fetchByUser(userId as string),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId || !rows) return;
    qc.setQueryData<IVitaCache>(vitaBaseKey, old => {
      const next = old
        ? {
            ...old,
            loaded: {
              ...old.loaded,
              users: new Set(old.loaded.users),
              types: new Set(old.loaded.types),
            },
          }
        : emptyCache();
      mergeIntoCache(next, rows, { userId });
      return next;
    });
  }, [rows, userId, qc]);

  return useVitaBase(
    cache => {
      if (!userId) return [] as oTVita[];
      const ids = cache.index.byUser[userId] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!userId },
  );
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) vitas for a specific `type` and return them from the base store.
 */
export function useReadVitasByType(type?: string) {
  const qc = useQueryClient();
  const { data: rows } = useQuery<oTVita[]>({
    queryKey: type ? netKey.byType(type) : ["noop"],
    queryFn: () => fetchByType(type as string),
    enabled: !!type,
  });

  useEffect(() => {
    if (!type || !rows) return;
    qc.setQueryData<IVitaCache>(vitaBaseKey, old => {
      const next = old
        ? {
            ...old,
            loaded: {
              ...old.loaded,
              users: new Set(old.loaded.users),
              types: new Set(old.loaded.types),
            },
          }
        : emptyCache();
      mergeIntoCache(next, rows, { type });
      return next;
    });
  }, [rows, type, qc]);

  return useVitaBase(
    cache => {
      if (!type) return [] as oTVita[];
      const ids = cache.index.byType[String(type)] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!type },
  );
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) vitas whose `name` contains the given search term (case-insensitive).
 * Entities are merged into the base store, but no "loaded" flags are set.
 * The view is then filtered client-side for consistency.
 */
export function useReadVitasByName(name: string | undefined) {
  const qc = useQueryClient();
  const term = (name ?? "").trim();

  const { data: rows } = useQuery<oTVita[]>({
    queryKey: term ? netKey.byName(term) : ["noop"],
    queryFn: () => fetchByNameContains(term),
    enabled: term.length > 0,
  });

  useEffect(() => {
    if (!rows) return;
    qc.setQueryData<IVitaCache>(vitaBaseKey, old => {
      const next = old
        ? {
            ...old,
            loaded: {
              ...old.loaded,
              users: new Set(old.loaded.users),
              types: new Set(old.loaded.types),
            },
          }
        : emptyCache();
      // Name is "ephemeral": merge entities only, no loaded markers
      mergeIntoCache(next, rows);
      return next;
    });
  }, [rows, qc]);

  return useVitaBase(
    cache => {
      const q = term.toLowerCase();
      if (!q) return [] as oTVita[];
      return cache.allIds
        .map(id => cache.byId[id])
        .filter(r => (r.name ?? "").toLowerCase().includes(q));
    },
    { enabled: term.length > 0 },
  );
}
