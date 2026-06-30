import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';
import type { Api } from '@/shared/data/db';

type CreateInput = Parameters<Api['vitas']['create']>[0];

export function useCreateVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => dataApi.vitas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
