// src/utils/supabase/api/tables/chronicles/readChronicles.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { oTChronicle } from "@/utils/supabase/api/tables/chronicles/_mapping";
import { normalizeTimestamps } from "../$read";

/* --------------------------------- Keys --------------------------------- */
/**
 * @author ChatGPT5
 *
 * Shared cache key under which the **normalized base store** is stored.
 * All views (all/own/byUser/byType/byName) eventually read from this cache.
 */
export const chronBaseKey = ["chronicles"] as const;

/**
 * @author ChatGPT5
 *
 * Internal “network keys”, used only to track each network fetch.
 * Results are **always** merged into the base store (`chronBaseKey`).
 */
const netKey = {
  all: () => ["chronicles", "net", "all"] as const,
  byUser: (userId: string) => ["chronicles", "net", "byUser", userId] as const,
  byType: (type: string) =>
    ["chronicles", "net", "byType", String(type)] as const,
  byName: (name: string) => ["chronicles", "net", "byName", name] as const,
  own: () => ["chronicles", "net", "own"] as const,
  byId: (id: string) => ["chronicles", "net", "byId", id] as const, // 🔹 NEU
};

/* ------------------------------ Base Cache ------------------------------ */

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
const emptyCache = (): IChronicleCache => ({
  byId: {},
  allIds: [],
  index: { byUser: {}, byType: {} },
  loaded: { all: false, users: new Set(), types: new Set() },
});

/* ---------------------------- Normalization ----------------------------- */

/**
 * @author ChatGPT5
 *
 * Normalisiert eine Chronicle-Row:
 * - `id` zu String
 * - `knots: string[]` -> `number[]` (ms since epoch)
 * - Bei nur 1 Knoten wird `Infinity` angehängt (wie in deiner bestehenden Logik)
 */
function normalizeChronicle(row: any): oTChronicle {
  const id = String(row.id);

  // Knots adjustments
  const knots: number[] = Array.isArray(row.knots)
    ? row.knots.map((k: string) => Date.parse(k))
    : [];

  if (knots.length % 2 != 0) knots.push(Infinity);

  // Rückgabe im oTChronicle-Shape (und restliche Felder durchreichen)
  return { ...row, id, knots, ...normalizeTimestamps(row) } as oTChronicle;
}

/**
 * @author ChatGPT5
 *
 * Merge function: normalizes rows into the cache, maintains indexes,
 * and optionally marks certain scopes as fully loaded.
 */
function mergeIntoCache(
  cache: IChronicleCache,
  rows: any[],
  mark?: { all?: boolean; userId?: string; type?: string },
) {
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

/* ------------------------------ Fetchers ------------------------------- */

const supa = () => createClient();

export async function fetchById(id: string): Promise<any | null> {
  const { data, error } = await supa()
    .from("chronicles")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/**
 * @author ChatGPT5
 *
 * Fetch all chronicles.
 */
export async function fetchAll(): Promise<any[]> {
  const { data, error } = await supa().from("chronicles").select("*");
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch chronicles by user_id.
 */
export async function fetchByUser(userId: string): Promise<any[]> {
  const { data, error } = await supa()
    .from("chronicles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch chronicles for current authenticated user.
 */
export async function fetchOwn(): Promise<{
  userId: string | null;
  chronicles: any[];
}> {
  const { data: ures, error: uerr } = await supa().auth.getUser();
  if (uerr) throw uerr;
  const userId = ures.user?.id ?? null;
  if (!userId) return { userId: null, chronicles: [] };
  const chronicles = await fetchByUser(userId);
  return { userId, chronicles };
}

/**
 * @author ChatGPT5
 *
 * Fetch chronicles by type (optional column).
 */
export async function fetchByType(type: string): Promise<any[]> {
  const { data, error } = await supa()
    .from("chronicles")
    .select("*")
    .eq("type", type);
  if (error) throw error;
  return data ?? [];
}

/**
 * @author ChatGPT5
 *
 * Fetch chronicles whose `name` contains the given term (case-insensitive).
 */
export async function fetchByNameContains(name: string): Promise<any[]> {
  const { data, error } = await supa()
    .from("chronicles")
    .select("*")
    .ilike("name", `%${name}%`);
  if (error) throw error;
  return data ?? [];
}

/* ---------------------------- Base Query Hook --------------------------- */

/**
 * @author ChatGPT5
 *
 * Hook for reactive access to the **shared base store** of chronicles.
 */
function useChronicleBase<T = oTChronicle[]>(
  select: (cache: IChronicleCache) => T,
  opts?: { enabled?: boolean; staleTime?: number },
) {
  const qc = useQueryClient();

  const q = useQuery<IChronicleCache, Error, T, typeof chronBaseKey>({
    queryKey: chronBaseKey,
    queryFn: () =>
      qc.getQueryData<IChronicleCache>(chronBaseKey) ?? emptyCache(),
    initialData: emptyCache(),
    staleTime: opts?.staleTime ?? Infinity,
    enabled: opts?.enabled ?? true,
    select,
  });

  return {
    chronicles: (q.data as T) ?? ([] as unknown as T),
    loading: q.isLoading,
    error: (q.error as Error) ?? null,
    refetch: q.refetch,
  };
}

/* --------------------------- Public Read Hooks -------------------------- */

/**
 * @author ChatGPT5
 *
 * Load (if necessary) **all** chronicles and return them from the base store.
 */
export function useReadAllChronicles() {
  const qc = useQueryClient();
  const { data: rows } = useQuery<any[]>({
    queryKey: netKey.all(),
    queryFn: fetchAll,
  });

  useEffect(() => {
    if (!rows) return;
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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

  return useChronicleBase(cache => cache.allIds.map(id => cache.byId[id]));
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) only the **current user's** chronicles and return them.
 */
export function useReadOwnChronicles() {
  const qc = useQueryClient();
  const { data } = useQuery<{ userId: string | null; chronicles: any[] }>({
    queryKey: netKey.own(),
    queryFn: fetchOwn,
  });

  useEffect(() => {
    if (!data?.userId) return;
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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
      mergeIntoCache(next, data.chronicles, {
        userId: data.userId ?? undefined,
      });
      return next;
    });
  }, [data, qc]);

  return useChronicleBase(cache => {
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
 * Load (if necessary) chronicles for a specific `userId`.
 */
export function useReadChroniclesByUser(userId?: string) {
  const qc = useQueryClient();
  const { data: rows } = useQuery<any[]>({
    queryKey: userId ? netKey.byUser(userId) : ["noop"],
    queryFn: () => fetchByUser(userId as string),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId || !rows) return;
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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

  return useChronicleBase(
    cache => {
      if (!userId) return [] as oTChronicle[];
      const ids = cache.index.byUser[userId] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!userId },
  );
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) chronicles for a specific `type`.
 * Requires a `type` column on `chronicles`.
 */
export function useReadChroniclesByType(type?: string) {
  const qc = useQueryClient();
  const { data: rows } = useQuery<any[]>({
    queryKey: type ? netKey.byType(type) : ["noop"],
    queryFn: () => fetchByType(type as string),
    enabled: !!type,
  });

  useEffect(() => {
    if (!type || !rows) return;
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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

  return useChronicleBase(
    cache => {
      if (!type) return [] as oTChronicle[];
      const ids = cache.index.byType[String(type)] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!type },
  );
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) chronicles whose `name` contains the search term.
 */
export function useReadChroniclesByName(name?: string) {
  const qc = useQueryClient();
  const term = (name ?? "").trim();

  const { data: rows } = useQuery<any[]>({
    queryKey: term ? netKey.byName(term) : ["noop"],
    queryFn: () => fetchByNameContains(term),
    enabled: term.length > 0,
  });

  useEffect(() => {
    if (!rows) return;
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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
      // Name ist "ephemeral": merge entities only, keine loaded-Marker
      mergeIntoCache(next, rows);
      return next;
    });
  }, [rows, qc]);

  return useChronicleBase(
    cache => {
      const q = term.toLowerCase();
      if (!q) return [] as oTChronicle[];
      return cache.allIds
        .map(id => cache.byId[id])
        .filter(r =>
          String((r as any).name ?? "")
            .toLowerCase()
            .includes(q),
        );
    },
    { enabled: term.length > 0 },
  );
}

// Optional nützliche Exporte
export { normalizeChronicle };

export function useReadChronicleById(id?: string | number) {
  const qc = useQueryClient();
  const sid = id == null ? undefined : String(id);

  // Netzwerk-Fetch nur, wenn eine id vorhanden ist
  const { data: row } = useQuery<any | null>({
    queryKey: sid ? netKey.byId(sid) : ["noop"],
    queryFn: () => fetchById(sid as string),
    enabled: !!sid,
  });

  // Ergebnis in den gemeinsamen Basestore mergen
  useEffect(() => {
    if (!sid) return;
    if (!row) return; // nichts zu mergen (nicht gefunden)
    qc.setQueryData<IChronicleCache>(chronBaseKey, old => {
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
      mergeIntoCache(next, [row]);
      return next;
    });
  }, [sid, row, qc]);

  // Selektor liefert das (ggf. gemergte) Entity zurück
  return useChronicleBase(
    cache => (sid ? (cache.byId[sid] as oTChronicle | undefined) : undefined),
    { enabled: !!sid },
  );
}
