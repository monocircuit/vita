import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';
import type { Api } from '../../../../electron/ipc/contracts';

type CreateInput = Parameters<Api['chronicles']['create']>[0];

export function useCreateChronicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => window.api.chronicles.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chroniclesQueryKey });
    },
  });
}
