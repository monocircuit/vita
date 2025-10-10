"use client";

import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { chroniclesBaseKey, netKey } from "../keys";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOwn } from "../fetchers/fetchOwn";

/**
 * @author ChatGPT5
 *
 * Load (if necessary) only the **current user's** chronicles and return them.
 */
export function useReadOwnChronicles() {
  const qc = useQueryClient();
  const q = useQuery<{ userId: string | null; chronicles: any[] }>({
    queryKey: netKey.own(),
    queryFn: fetchOwn,
  });

  useEffect(() => {
    if (!q.data?.userId) return;
    qc.setQueryData<IChronicleCache>(chroniclesBaseKey, (old: any) => {
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
      mergeIntoCache(next, q.data.chronicles, {
        userId: q.data.userId ?? undefined,
      });
      return next;
    });
  }, [q.data, qc]);

  return useReadChronicleBase(
    q,
    cache => {
      const ids = Array.from(cache.loaded.users).flatMap(
        uid => cache.index.byUser[uid] ?? [],
      );
      const uniq = Array.from(new Set(ids));

      return uniq.map(id => cache.byId[id]);
    },
    { enabled: !!q.data?.userId },
  );
}
