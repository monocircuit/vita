import { useQuery } from '@tanstack/react-query';

export const entitiesQueryKey = ['entities'] as const;

export function useEntitiesReader() {
  return useQuery({
    queryKey: entitiesQueryKey,
    queryFn: () => window.api.entities.list(),
  });
}
