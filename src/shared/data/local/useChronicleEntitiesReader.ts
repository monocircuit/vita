import { queryOptions, useQuery } from '@tanstack/react-query';

export const chronicleEntitiesQueryKey = ['chronicleEntities'] as const;

export const chronicleEntitiesQueryOptions = () =>
  queryOptions({
    queryKey: chronicleEntitiesQueryKey,
    queryFn: () => window.api.chronicleEntities.list(),
  });

export function useChronicleEntitiesReader() {
  return useQuery(chronicleEntitiesQueryOptions());
}
