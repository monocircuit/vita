import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';

export function useDeleteChronicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dataApi.chronicles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chroniclesQueryKey });
    },
  });
}
