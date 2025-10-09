"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chroniclesBaseKey, netKey } from "../keys";
import { fetchById } from "../fetchers/fetchById";
import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { oTChronicle } from "../../_mapping";

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
      mergeIntoCache(next, [row]);
      return next;
    });
  }, [sid, row, qc]);

  // Selektor liefert das (ggf. gemergte) Entity zurück
  return useReadChronicleBase(
    cache => (sid ? (cache.byId[sid] as oTChronicle | undefined) : undefined),
    { enabled: !!sid },
  );
}
