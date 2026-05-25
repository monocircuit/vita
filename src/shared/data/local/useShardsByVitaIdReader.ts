import { useQuery } from '@tanstack/react-query';

export const shardsQueryKey = ['shards'] as const;

export function useShardsByVitaIdReader(vitaId: number | null | undefined) {
  return useQuery({
    queryKey: [...shardsQueryKey, 'byVitaId', vitaId],
    queryFn: () => window.api.shards.byVitaId(vitaId!),
    enabled: vitaId != null,
  });
}
