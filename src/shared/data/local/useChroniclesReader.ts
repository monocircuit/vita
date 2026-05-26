import { queryOptions, useQuery } from '@tanstack/react-query';

export const chroniclesQueryKey = ['chronicles'] as const;

export const chroniclesQueryOptions = () =>
  queryOptions({
    queryKey: chroniclesQueryKey,
    queryFn: () => window.api.chronicles.list(),
  });

export const chronicleByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: [...chroniclesQueryKey, 'byId', id] as const,
    queryFn: () => window.api.chronicles.byId(id),
  });

export function useChroniclesReader() {
  return useQuery(chroniclesQueryOptions());
}

export function useChronicleByIdReader(id: number | null | undefined) {
  return useQuery({
    ...chronicleByIdQueryOptions(id ?? 0),
    enabled: id != null,
  });
}
