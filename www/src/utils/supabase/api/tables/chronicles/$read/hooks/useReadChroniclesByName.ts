"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chroniclesBaseKey, netKey } from "../keys";
import { fetchByNameContains } from "../fetchers/fetchByNameContains";
import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { oTChronicle } from "../../_mapping";

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
      // Name ist "ephemeral": merge entities only, keine loaded-Marker
      mergeIntoCache(next, rows);
      return next;
    });
  }, [rows, qc]);

  return useReadChronicleBase(
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
