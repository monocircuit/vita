import { useQuery } from '@tanstack/react-query';

export const addressesQueryKey = ['addresses'] as const;

export function useAddressesReader() {
  return useQuery({
    queryKey: addressesQueryKey,
    queryFn: () => window.api.addresses.list(),
  });
}
