import { createClient } from "@/shared/supabase/client";
import Engine from "@/shared/processing/engines/dynamic/Engine";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VitasShardsDynamic } from "../map";

const useStoreDynamicShards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shards: VitasShardsDynamic["Normalized"][]) => {
      const denormalizedShards: ShardDynamic.Denormalized[] = shards.map(
        denormalizeDynamicShard,
      );

      const client = createClient();

      client
        .from("vitas_shards_dynamic")
        .delete()
        .eq("vita_id", shards[0].vitaId);

      client.from("vitas_shards_dynamic").upsert(denormalizedShards);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vitas", "shards", "dynamic"],
      });
    },
  });
};

export default useStoreDynamicShards;
