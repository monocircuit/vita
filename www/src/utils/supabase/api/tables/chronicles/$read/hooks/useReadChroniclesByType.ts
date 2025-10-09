"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chroniclesBaseKey, netKey } from "../keys";
import { fetchByType } from "../fetchers/fetchByType";
import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { oTChronicle } from "../../_mapping";

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
      mergeIntoCache(next, rows, { type });
      return next;
    });
  }, [rows, type, qc]);

  return useReadChronicleBase(
    cache => {
      if (!type) return [] as oTChronicle[];
      const ids = cache.index.byType[String(type)] ?? [];
      return ids.map(id => cache.byId[id]);
    },
    { enabled: !!type },
  );
}
