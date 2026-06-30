import { dataApi } from '@/shared/data/db';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const entitiesQueryKey = ['entities'] as const;

export const entitiesQueryOptions = () =>
  queryOptions({
    queryKey: entitiesQueryKey,
    queryFn: () => dataApi.entities.list(),
  });

export function useEntitiesReader() {
  return useQuery(entitiesQueryOptions());
}
