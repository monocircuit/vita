import { dataApi } from '@/shared/data/db';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const chronicleEntitiesQueryKey = ['chronicleEntities'] as const;

export const chronicleEntitiesQueryOptions = () =>
  queryOptions({
    queryKey: chronicleEntitiesQueryKey,
    queryFn: () => dataApi.chronicleEntities.list(),
  });

export function useChronicleEntitiesReader() {
  return useQuery(chronicleEntitiesQueryOptions());
}
