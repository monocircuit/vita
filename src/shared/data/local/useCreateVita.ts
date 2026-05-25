import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';
import type { Api } from '../../../../electron/ipc/contracts';

type CreateInput = Parameters<Api['vitas']['create']>[0];

export function useCreateVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => window.api.vitas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
