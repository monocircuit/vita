import { queryOptions, useQuery } from '@tanstack/react-query';

export const shardsQueryKey = ['shards'] as const;

export const shardsByVitaIdQueryOptions = (vitaId: number) =>
  queryOptions({
    queryKey: [...shardsQueryKey, 'byVitaId', vitaId] as const,
    queryFn: () => window.api.shards.byVitaId(vitaId),
  });

export function useShardsByVitaIdReader(vitaId: number | null | undefined) {
  return useQuery({
    ...shardsByVitaIdQueryOptions(vitaId ?? 0),
    enabled: vitaId != null,
  });
}
