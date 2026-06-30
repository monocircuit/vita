import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesQueryKey } from './useEntitiesReader';
import type { Api } from '@/shared/data/db';

type CreateInput = Parameters<Api['entities']['create']>[0];

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => dataApi.entities.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entitiesQueryKey });
    },
  });
}
