import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesQueryKey } from './useEntitiesReader';
import type { Api } from '../../../../electron/ipc/contracts';

type UpdatePatch = Parameters<Api['entities']['update']>[1];

export function useUpdateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      window.api.entities.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entitiesQueryKey });
    },
  });
}
