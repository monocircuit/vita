import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesQueryKey } from './useAddressesReader';
import type { Api } from '@/shared/data/db';

type CreateInput = Parameters<Api['addresses']['create']>[0];

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => dataApi.addresses.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
}
