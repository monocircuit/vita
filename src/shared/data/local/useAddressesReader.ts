import { queryOptions, useQuery } from '@tanstack/react-query';

export const addressesQueryKey = ['addresses'] as const;

export const addressesQueryOptions = () =>
  queryOptions({
    queryKey: addressesQueryKey,
    queryFn: () => window.api.addresses.list(),
  });

export function useAddressesReader() {
  return useQuery(addressesQueryOptions());
}
