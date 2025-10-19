"use client";

import { emptyCache, IChronicleCache, mergeIntoCache } from "../cache";
import { chroniclesBaseKey, netKey } from "../keys";
import { useReadChronicleBase } from "./useReadChronicleBase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOwn } from "../fetchers/fetchOwn";
import { oTChronicle } from "../../_mapping";
import { Net, useFull } from "@/hooks/useFull";
import { useNetFlow } from "@/utils/tanstack/hooks/useNetFlow";

interface Data {
  userId: string;
  chronicles: oTChronicle[];
}

/**
 * @author ChatGPT5
 *
 * Load (if necessary) only the **current user's** chronicles and return them.
 */
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

  // inside useReadOwnChronicles()

  useNetFlow<
    { userId: string; chronicles: oTChronicle[] }, // TFull
    "userId", // TSlimKey
    unknown, // TError
    any, // TRawRow (server row)
    oTChronicle, // TRow after normalize
    { id: string; user_id?: string; type?: string; title: string } // TStored in Base
  >({
    query: q, // your Net<TFull, "userId"> query
    netKey: netKey.own(),

    base: {
      baseKey: chroniclesBaseKey,
      createEmpty: () =>
        createEmptyBaseCache({
          indices: ["byUser", "byType"],
          scopes: ["users", "types"],
        }),
      mergeOptions: {
        selectRows: f => f.chronicles,
        normalizeRow: normalizeChronicle, // optional
        project: c => ({
          id: String(c.id),
          user_id: c.user_id,
          type: c.type,
          title: c.title,
        }),
        selectKeyParts: r => [r.id], // or [r.user_id, r.type] for composite PK
        indices: [
          {
            name: "byUser",
            select: r => (r.user_id ? [r.user_id] : undefined),
          },
          { name: "byType", select: r => (r.type ? [r.type] : undefined) },
        ],
        // mark scopes as fully loaded based on the payload
        markLoadedFromFull: f => [{ scope: "users", value: f.userId }],
      },
    },

    toSlim: full => ({
      userId: full.userId,
      ids: full.chronicles.map(r => String(r.id)),
      _slim: true as const,
    }),
  });

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
