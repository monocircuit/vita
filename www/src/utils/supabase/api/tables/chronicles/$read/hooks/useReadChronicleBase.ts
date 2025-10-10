"use client";

import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { oTChronicle } from "../../_mapping";
import { emptyCache, IChronicleCache } from "../cache";
import { chroniclesBaseKey } from "../keys";

/**
 * @author ChatGPT5
 *
 * A custom hook for reading and managing the base data of chronicles from a cache.
 * This hook leverages React Query to fetch and manage the data, allowing for
 * efficient state management and caching.
 *
 * @template T - The type of data to be returned. Defaults to an array of `oTChronicle`.
 *
 * @param select - A function that selects and transforms the data from the cache.
 *                 It receives the cache (`IChronicleCache`) as an argument and
 *                 returns the desired data of type `T`.
 * @param opts - Optional configuration for the hook.
 * @param opts.enabled - A boolean to enable or disable the query. Defaults to `true`.
 * @param opts.staleTime - The duration (in milliseconds) for which the data is considered fresh.
 *                         Defaults to `Infinity`.
 *
 * @returns An object containing:
 * - `chronicles`: The selected data of type `T`. Defaults to an empty array if no data is available.
 * - `loading`: A boolean indicating whether the query is currently loading.
 * - `error`: An error object if the query fails, or `null` if there is no error.
 * - `refetch`: A function to manually refetch the data.
 */
export function useReadChronicleBase<T = oTChronicle[]>(
  queryResult: UseQueryResult<
    {
      userId: string | null;
      chronicles: any[];
    },
    Error
  >,
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
    ...queryResult,
  };
}
