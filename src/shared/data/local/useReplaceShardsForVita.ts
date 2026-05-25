import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shardsQueryKey } from './useShardsByVitaIdReader';
import type { Api } from '../../../../electron/ipc/contracts';

type ReplaceParams = Parameters<Api['shards']['replaceForVita']>;

export function useReplaceShardsForVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vitaId, shards }: { vitaId: number; shards: ReplaceParams[1] }) =>
      window.api.shards.replaceForVita(vitaId, shards),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...shardsQueryKey, 'byVitaId', vars.vitaId] });
    },
  });
}
