"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { oTChronicle } from "../../_mapping";
import { emptyCache, IChronicleCache } from "../cache";
import { chroniclesBaseKey } from "../keys";

/**
 * @author ChatGPT5
 *
 * Hook for reactive access to the **shared base store** of chronicles.
 */
export function useReadChronicleBase<T = oTChronicle[]>(
  select: (cache: IChronicleCache) => T,
  opts?: { enabled?: boolean; staleTime?: number },
) {
  const qc = useQueryClient();

  const q = useQuery<IChronicleCache, Error, T, typeof chroniclesBaseKey>({
    queryKey: chroniclesBaseKey,
    queryFn: () =>
      qc.getQueryData<IChronicleCache>(chroniclesBaseKey) ?? emptyCache(),
    initialData: emptyCache(),
    staleTime: opts?.staleTime ?? Infinity,
    enabled: opts?.enabled ?? true,
    select,
  });

  return {
    chronicles: (q.data as T) ?? ([] as unknown as T),
    loading: q.isLoading,
    error: (q.error as Error) ?? null,
    refetch: q.refetch,
  };
}
