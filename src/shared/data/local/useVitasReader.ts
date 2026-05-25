import { useQuery } from '@tanstack/react-query';

export const vitasQueryKey = ['vitas'] as const;

export function useVitasReader() {
  return useQuery({
    queryKey: vitasQueryKey,
    queryFn: () => window.api.vitas.list(),
  });
}

export function useVitaByIdReader(id: number | null | undefined) {
  return useQuery({
    queryKey: [...vitasQueryKey, 'byId', id],
    queryFn: () => window.api.vitas.byId(id!),
    enabled: id != null,
  });
}
