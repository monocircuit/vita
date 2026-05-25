import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';

export function useDeleteVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => window.api.vitas.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
