"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chroniclesBaseKey, netKey } from "../keys";
import { fetchByUser } from "../fetchers/fetchByUser";
import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { oTChronicle } from "../../mapping";

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
    qc.setQueryData<IChronicleCache>(chroniclesBaseKey, old => {
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

  return useReadChronicleBase(
    cache => {
      if (!userId) return [] as oTChronicle[];
      const ids = cache.index.byUser[userId] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!userId },
  );
}
