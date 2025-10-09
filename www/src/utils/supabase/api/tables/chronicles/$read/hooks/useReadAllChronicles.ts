"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chroniclesBaseKey, netKey } from "../keys";
import { fetchAll } from "../fetchers/fetchAll";
import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { useReadChronicleBase } from "./useReadChronicleBase";

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
      mergeIntoCache(next, rows, { all: true });
      return next;
    });
  }, [rows, qc]);

  return useReadChronicleBase(cache => cache.allIds.map(id => cache.byId[id]));
}
