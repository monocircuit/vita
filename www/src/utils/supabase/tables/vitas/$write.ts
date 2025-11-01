// src/utils/supabase/api/tables/vitas/$create.ts
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { i$Vita, type iTVita, o$Vita, type oTVita } from "./mapping";
import { vitaBaseKey, type IVitaCache } from "./$read";

/* --------------------------------- Setup -------------------------------- */
const supa = () => createClient();

/* --------------------------- Cache-Merge Helper -------------------------- */
function mergeVitasIntoCache(cache: IVitaCache, rows: oTVita[]) {
  for (const r of rows) {
    const id = r.id as unknown as string | number;
    const existed = cache.byId[id];

    cache.byId[id] = r as any;
    if (!existed) cache.allIds.push(id);

    // byUser index
    const uid = (r as any).user_id as string | undefined;
    if (uid) {
      if (!cache.index.byUser[uid]) cache.index.byUser[uid] = [];
      if (!cache.index.byUser[uid].includes(id))
        cache.index.byUser[uid].push(id);
    }

    // byType index (falls du ihn in readVita nutzt)
    const t = String((r as any).type ?? "");
    if (t) {
      if (!cache.index.byType[t]) cache.index.byType[t] = [];
      if (!cache.index.byType[t].includes(id)) cache.index.byType[t].push(id);
    }
  }
}

function emptyCache(): IVitaCache {
  return {
    byId: {},
    allIds: [],
    index: { byUser: {}, byType: {} },
    loaded: { all: false, users: new Set(), types: new Set() },
  };
}

/* --------------------------------- API ---------------------------------- */
export async function insertVitas(inputs: iTVita[]): Promise<oTVita[]> {
  const sb = supa();

  // Eingaben validieren/normalisieren
  const validated = inputs.map(v => i$Vita.parse(v));

  // aktuellen User holen (Fallback für user_id)
  const { data: ures, error: uerr } = await sb.auth.getUser();
  if (uerr) throw uerr;
  const defaultUserId = ures.user?.id ?? null;

  const payload = validated.map(v => ({
    ...v,
    user_id: v.user_id ?? defaultUserId,
  }));

  // ohne user_id brechen wir bewusst früh ab
  if (payload.some(p => !p.user_id)) {
    throw new Error(
      "user_id fehlt: kein eingeloggter User und keine user_id im Payload übergeben.",
    );
  }

  const { data, error } = await sb.from("vitas").insert(payload).select("*");
  if (error) throw error;

  return (data ?? []).map(row => o$Vita.parse(row));
}

/* ------------------------------ Mutation Hooks -------------------------- */
/** Eine Vita erstellen und in den shared Cache mergen. */
export function useCreateVita(
  options?: UseMutationOptions<oTVita, unknown, iTVita, unknown>,
) {
  const qc = useQueryClient();

  return useMutation<oTVita, unknown, iTVita, unknown>({
    mutationFn: async input => {
      const created = await insertVitas([input]);
      return created[0];
    },
    onSuccess: (created, variables, ctx) => {
      if (created) {
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
          mergeVitasIntoCache(next, [created]);
          return next;
        });
      }
      options?.onSuccess?.(created, variables, ctx);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    // alle anderen Optionen (retry, meta, gcTime, etc.)
    ...options,
  });
}

/** Mehrere Vitas erstellen und in den shared Cache mergen. */
export function useCreateVitas(
  options?: UseMutationOptions<oTVita[], unknown, iTVita[], unknown>,
) {
  const qc = useQueryClient();

  return useMutation<oTVita[], unknown, iTVita[], unknown>({
    mutationFn: inputs => insertVitas(inputs),
    onSuccess: (created, variables, ctx) => {
      if (created?.length) {
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
          mergeVitasIntoCache(next, created);
          return next;
        });
      }
      options?.onSuccess?.(created, variables, ctx);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    ...options,
  });
}
