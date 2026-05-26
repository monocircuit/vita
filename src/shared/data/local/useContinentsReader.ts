import { queryOptions, useQuery } from '@tanstack/react-query';

export const continentsQueryKey = ['continents'] as const;

export const continentsQueryOptions = () =>
  queryOptions({
    queryKey: continentsQueryKey,
    queryFn: () => window.api.continents.list(),
    staleTime: Infinity,
  });

export function useContinentsReader() {
  return useQuery(continentsQueryOptions());
}
