import { useQuery } from '@tanstack/react-query';

export const chroniclesQueryKey = ['chronicles'] as const;

export function useChroniclesReader() {
  return useQuery({
    queryKey: chroniclesQueryKey,
    queryFn: () => window.api.chronicles.list(),
  });
}

export function useChronicleByIdReader(id: number | null | undefined) {
  return useQuery({
    queryKey: [...chroniclesQueryKey, 'byId', id],
    queryFn: () => window.api.chronicles.byId(id!),
    enabled: id != null,
  });
}
