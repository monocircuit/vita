import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';
import type { Api } from '../../../../electron/ipc/contracts';

type UpdatePatch = Parameters<Api['chronicles']['update']>[1];

export function useUpdateChronicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      window.api.chronicles.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chroniclesQueryKey });
    },
  });
}
