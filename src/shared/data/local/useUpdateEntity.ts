import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesQueryKey } from './useEntitiesReader';
import type { Api } from '@/shared/data/db';

type UpdatePatch = Parameters<Api['entities']['update']>[1];

export function useUpdateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdatePatch }) =>
      dataApi.entities.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entitiesQueryKey });
    },
  });
}
