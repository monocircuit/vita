"use client";

import { useEffect } from "react";
import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { chroniclesBaseKey, netKey } from "../keys";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOwn } from "../fetchers/fetchOwn";
import { oTChronicle } from "../../_mapping";

type NetFull<T> = T & { _slim?: false };
type NetSlim<T, K extends keyof T> = Pick<T, K> & {
  ids: string[];
  _slim: true;
};
type Net<T, K extends keyof T> = null | NetFull<T> | NetSlim<T, K>;

interface Data {
  userId: string;
  chronicles: oTChronicle[];
}

function isFull<T, K extends keyof T>(data: Net<T, K>): data is NetFull<T> {
  console.log("isFull", data);
  return !!data && (data as any)._slim !== true;
}

function isSlim<T, K extends keyof T>(data: Net<T, K>): data is NetSlim<T, K> {
  return !!data && (data as any)._slim === true;
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) only the **current user's** chronicles and return them.
 */
// useReadOwnChronicles.ts
export function useReadOwnChronicles() {
  const qc = useQueryClient();

  const q = useQuery<Net<Data, "userId">>({
    queryKey: netKey.own(),
    queryFn: fetchOwn,
    staleTime: 5 * 60_000, // volle 10/10-Funktionalität
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (q.isSuccess && isFull(q.data)) {
      const data = q.data;

      qc.setQueryData<IChronicleCache>(chroniclesBaseKey, old => {
        const next = old ?? emptyCache();
        mergeIntoCache(next, data.chronicles, {
          userId: data.userId,
        });
        return next;
      });

      const ids = data.chronicles.map(r => String(r.id));
      qc.setQueryData(netKey.own(), {
        userId: data.userId,
        ids,
        _slim: true,
      });
    }

    // nur feuern, wenn echte neue Daten ankamen
  }, [q.status, q.dataUpdatedAt]);

  // Base lesen (volle Daten kommen immer aus dem Base-Store)
  return useReadChronicleBase(
    q as any, // Status durchreichen
    cache => {
      // optional: falls du net.data?.ids nutzen willst, kannst du sie hier verwerten
      return Object.values(cache.byId); // oder deine bisherige Auswahl (byUser etc.)
    },
    { enabled: true },
  );
}
