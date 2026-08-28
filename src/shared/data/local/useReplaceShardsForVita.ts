import { dataApi } from '@/shared/data/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shardsQueryKey } from './useShardsByVitaIdReader';
import { chroniclesQueryKey } from './useChroniclesReader';
import type { Api } from '@/shared/data/db';

type ReplaceParams = Parameters<Api['shards']['replaceForVita']>;

export function useReplaceShardsForVita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vitaId, shards }: { vitaId: number; shards: ReplaceParams[1] }) =>
      dataApi.shards.replaceForVita(vitaId, shards),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...shardsQueryKey, 'byVitaId', vars.vitaId] });
      // Shards define which chronicles belong to a vita, so chronicles.byVitaId
      // is derived from them and has to be refetched too — otherwise a newly
      // created chronicle only shows up after a page reload.
      queryClient.invalidateQueries({
        queryKey: [...chroniclesQueryKey, 'byVitaId', vars.vitaId],
      });
    },
  });
}
