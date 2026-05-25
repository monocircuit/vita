import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesQueryKey } from './useEntitiesReader';
import type { Api } from '../../../../electron/ipc/contracts';

type CreateInput = Parameters<Api['entities']['create']>[0];

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => window.api.entities.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entitiesQueryKey });
    },
  });
}
