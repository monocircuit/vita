import { queryOptions, useQuery } from '@tanstack/react-query';

export const vitasQueryKey = ['vitas'] as const;

export const vitasQueryOptions = () =>
  queryOptions({
    queryKey: vitasQueryKey,
    queryFn: () => window.api.vitas.list(),
  });

export const vitaByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: [...vitasQueryKey, 'byId', id] as const,
    queryFn: () => window.api.vitas.byId(id),
  });

export function useVitasReader() {
  return useQuery(vitasQueryOptions());
}

export function useVitaByIdReader(id: number | null | undefined) {
  return useQuery({
    ...vitaByIdQueryOptions(id ?? 0),
    enabled: id != null,
  });
}
