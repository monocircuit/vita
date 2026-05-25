import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitasQueryKey } from './useVitasReader';
import type { Api } from '../../../../electron/ipc/contracts';

type UpdatePatch = Parameters<Api['vitas']['update']>[1];

export function useUpdateVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      window.api.vitas.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vitasQueryKey });
    },
  });
}
