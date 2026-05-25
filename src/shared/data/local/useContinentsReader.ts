import { useQuery } from '@tanstack/react-query';

export function useContinentsReader() {
  return useQuery({
    queryKey: ['continents'],
    queryFn: () => window.api.continents.list(),
    staleTime: Infinity,
  });
}
