import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chroniclesQueryKey } from './useChroniclesReader';
import type { Api } from '@/shared/data/db';

type UpdatePatch = Parameters<Api['chronicles']['update']>[1];

export function useUpdateChronicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      dataApi.chronicles.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chroniclesQueryKey });
    },
  });
}
