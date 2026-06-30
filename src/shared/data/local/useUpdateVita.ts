import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';
import type { Api } from '@/shared/data/db';

type UpdatePatch = Parameters<Api['vitas']['update']>[1];

export function useUpdateVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      dataApi.vitas.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
