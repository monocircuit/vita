import { queryOptions, useQuery } from '@tanstack/react-query';

export const countriesQueryKey = ['countries'] as const;

export const countriesQueryOptions = () =>
  queryOptions({
    queryKey: countriesQueryKey,
    queryFn: () => window.api.countries.list(),
    staleTime: Infinity,
  });

export function useCountriesReader() {
  return useQuery(countriesQueryOptions());
}
