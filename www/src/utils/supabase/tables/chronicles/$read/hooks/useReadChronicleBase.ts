"use client";

import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { oTChronicle } from "../../mapping";
import { emptyCache, IChronicleCache } from "../cache";
import { chroniclesBaseKey } from "../keys";

/**
 * Liest synchronisiert aus dem Base-Store (normalisiert).
 * Reicht die Netzwerk-Statuswerte explizit durch.
 */
export function useReadChronicleBase<T = oTChronicle[]>(
  net: UseQueryResult<{ userId: string | null; chronicles: any[] }, Error>,
  select: (cache: IChronicleCache) => T,
  opts?: { enabled?: boolean; staleTime?: number },
) {
  const qc = useQueryClient();

  const base = useQuery<IChronicleCache, Error, T, typeof chroniclesBaseKey>({
    queryKey: chroniclesBaseKey,
    queryFn: () =>
      qc.getQueryData<IChronicleCache>(chroniclesBaseKey) ?? emptyCache(),
    initialData: emptyCache(),
    staleTime: opts?.staleTime ?? Infinity,
    enabled: opts?.enabled ?? true,
    select,
  });

  return {
    // Daten aus Base-Store
    chronicles: (base.data as T) ?? ([] as unknown as T),

    // Netzwerk-Status klar durchreichen (kein Spread-Zufall)
    isLoading: net.isLoading,
    isFetching: net.isFetching,
    isSuccess: net.isSuccess,
    isError: net.isError,
    error: net.error ?? null,
    refetch: net.refetch,
  };
}
