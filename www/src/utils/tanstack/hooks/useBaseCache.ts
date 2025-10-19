"use client";

import {
  useQuery,
  useQueryClient,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";

/**
 * @author Lukas Diegelmann
 *
 * A tiny utility to type-narrow an identity selector when none is provided.
 */
function identity<T>(x: T): T {
  return x;
}

/**
 * @author Lukas Diegelmann
 *
 * Generic hook to read a cache object from React Query, with an optional selector,
 * and propagate network status from a separate "net" query if provided.
 *
 * It mirrors the pattern of your specialized `useReadChronicleBase`, but is fully
 * reusable for *any* cache you keep under a known `queryKey`.
 *
 * - Reads the cache from the QueryClient (no fetch)
 * - Initializes with `emptyFactory()` so consumers always get a stable shape
 * - Applies `select(cache)` if given, otherwise returns the cache itself
 * - Passes through `isLoading/isFetching/...` from `net` when provided
 *
 * @typeParam TCache    The full cache object stored under `queryKey`
 * @typeParam TSelected The derived selection returned to the component (defaults to TCache)
 *
 * @param params.net              Optional network query whose status should be surfaced
 * @param params.queryKey         The React Query key under which the cache lives
 * @param params.emptyFactory     Factory to create an empty cache shape
 * @param params.select           Optional selector: cache → selected data (defaults to identity)
 * @param params.options.enabled  Control query enablement (default: true)
 * @param params.options.staleTime Staleness for the *local* cache read (default: Infinity)
 *
 * @returns An object containing:
 * - `data`    → the selected result (TSelected)
 * - `cache`   → the raw cache (TCache)
 * - `isLoading/isFetching/isSuccess/isError/error/refetch` → from `net` if provided, else from the local read
 *
 * @example
 * ```ts
 * // Example: chronicles
 * const { data: chroniclesByUser, isFetching } = useBaseCache({
 *   net, // your network query result
 *   queryKey: chroniclesBaseKey,
 *   emptyFactory: emptyCache,
 *   select: (cache) => cache.byUser["u42"] ?? [],
 * });
 * ```
 */
export function useBaseCache<TCache, TSelected = TCache>(params: {
  net?: UseQueryResult<any, Error>;
  queryKey: QueryKey;
  emptyFactory: () => TCache;
  select?: (cache: TCache) => TSelected;
  options?: { enabled?: boolean; staleTime?: number };
}) {
  const { net, queryKey, emptyFactory, select, options } = params;
  const qc = useQueryClient();

  const base = useQuery<TCache, Error, TSelected, QueryKey>({
    queryKey,
    queryFn: () => qc.getQueryData<TCache>(queryKey) ?? emptyFactory(),
    initialData: emptyFactory(),
    staleTime: options?.staleTime ?? Infinity,
    enabled: options?.enabled ?? true,
    select: select ?? (identity as (c: TCache) => TSelected),
  });

  // Prefer network status if provided; otherwise surface the local read status
  const isLoading = net?.isLoading ?? base.isLoading;
  const isFetching = net?.isFetching ?? base.isFetching;
  const isSuccess = net?.isSuccess ?? base.isSuccess;
  const isError = net?.isError ?? base.isError;
  const error = net?.error ?? base.error ?? null;
  const refetch = net?.refetch ?? base.refetch;

  return {
    data: base.data, // TSelected
    cache: base.data as unknown as TCache, // handy when select narrows data; cast if needed
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  };
}
