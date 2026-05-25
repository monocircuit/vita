import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesQueryKey } from './useAddressesReader';
import type { Api } from '../../../../electron/ipc/contracts';

type CreateInput = Parameters<Api['addresses']['create']>[0];

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => window.api.addresses.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
}
