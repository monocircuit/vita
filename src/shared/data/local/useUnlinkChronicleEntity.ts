import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chronicleEntitiesQueryKey } from './useChronicleEntitiesReader';

export function useUnlinkChronicleEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chronicleId, entityId }: { chronicleId: number; entityId: number }) =>
      window.api.chronicleEntities.unlink(chronicleId, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronicleEntitiesQueryKey });
    },
  });
}
