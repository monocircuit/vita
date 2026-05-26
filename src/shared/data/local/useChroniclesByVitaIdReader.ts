import { queryOptions, useQuery } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';

export const chroniclesByVitaIdQueryOptions = (vitaId: number) =>
  queryOptions({
    queryKey: [...chroniclesQueryKey, 'byVitaId', vitaId] as const,
    queryFn: () => window.api.chronicles.byVitaId(vitaId),
  });

export function useChroniclesByVitaIdReader(vitaId: number | null | undefined) {
  return useQuery({
    ...chroniclesByVitaIdQueryOptions(vitaId ?? 0),
    enabled: vitaId != null,
  });
}
