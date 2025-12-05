import { createClient } from "@/shared/supabase/client";
import { $Schemas, Schemas } from "@/shared/supabase/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useStoreDynamicShards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      shards: Schemas["VitasShardsDynamic"]["Normalized"][],
    ) => {
      const denormalizedShards: Schemas["VitasShardsDynamic"]["Denormalized"][] =
        shards.map(shard =>
          $Schemas.VitasShardsDynamic.Denormalize.parse(shard),
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
