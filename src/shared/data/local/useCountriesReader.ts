import { useQuery } from '@tanstack/react-query';

export function useCountriesReader() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => window.api.countries.list(),
    staleTime: Infinity,
  });
}
