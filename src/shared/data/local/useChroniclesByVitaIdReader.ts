import { useQuery } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';

export function useChroniclesByVitaIdReader(vitaId: number | null | undefined) {
  return useQuery({
    queryKey: [...chroniclesQueryKey, 'byVitaId', vitaId],
    queryFn: () => window.api.chronicles.byVitaId(vitaId!),
    enabled: vitaId != null,
  });
}
