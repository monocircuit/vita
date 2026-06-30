import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';

export function useDeleteVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dataApi.vitas.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
