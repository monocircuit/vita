"use client";

import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { chroniclesBaseKey, netKey } from "../keys";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOwn } from "../fetchers/fetchOwn";

/**
 * Lädt (nur falls nötig) die Chronicles des aktuellen Users
 * und merged sie in den zentralen Base-Store.
 * Der Netzwerk-Query wird nach dem Merge entfernt (keine Doppelhaltung).
 */
export function useReadOwnChronicles() {
  const qc = useQueryClient();

  const net = useQuery<{ userId: string | null; chronicles: any[] }>({
    queryKey: netKey.own(),
    queryFn: fetchOwn,
    staleTime: 0, // Netz-Query ist nur Transportkanal
    gcTime: 0, // direkt wegräumen, wenn unbenutzt
  });

  useEffect(() => {
    if (net.status !== "success") return;
    if (!net.data?.userId) return;

    // in Base-Store mergen
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
      mergeIntoCache(next, net.data.chronicles, {
        userId: net.data.userId ?? undefined,
      });
      return next;
    });

    // Netz-Query-Daten entfernen -> keine Doppelhaltung
    qc.removeQueries({ queryKey: netKey.own(), exact: true });

    // nur triggern, wenn wirklich neue Daten kamen
  }, [net.status, net.dataUpdatedAt, net.data?.userId]);

  return useReadChronicleBase(
    net,
    cache => {
      const ids = Array.from(cache.loaded.users).flatMap(
        uid => cache.index.byUser[uid] ?? [],
      );
      const uniq = Array.from(new Set(ids));
      return uniq.map(id => cache.byId[id]);
    },
    // Base-Reader darf auch ohne userId aktiv sein;
    // falls du strikt sein willst, lass enabled stehen:
    { enabled: true },
  );
}
