import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chronicleEntitiesQueryKey } from './useChronicleEntitiesReader';

export function useLinkChronicleEntities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chronicleId, entityIds }: { chronicleId: number; entityIds: number[] }) =>
      dataApi.chronicleEntities.linkMany(chronicleId, entityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronicleEntitiesQueryKey });
    },
  });
}
