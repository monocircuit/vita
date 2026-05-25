import { useQuery } from '@tanstack/react-query';

export const chronicleEntitiesQueryKey = ['chronicleEntities'] as const;

export function useChronicleEntitiesReader() {
  return useQuery({
    queryKey: chronicleEntitiesQueryKey,
    queryFn: () => window.api.chronicleEntities.list(),
  });
}
