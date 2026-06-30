import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';
import type { Api } from '@/shared/data/db';

type CreateInput = Parameters<Api['chronicles']['create']>[0];

export function useCreateChronicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => dataApi.chronicles.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chroniclesQueryKey });
    },
  });
}
