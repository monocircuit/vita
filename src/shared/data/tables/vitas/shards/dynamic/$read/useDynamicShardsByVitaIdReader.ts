"use client";

import TanstackReader from "@/shared/data/tanstack";

const dynamicShardsReader = TanstackReader.Table.withArgs<[vitaId: string]>();

const dynamicShardsTable = dynamicShardsReader.table("vitasShardsDynamic", {
  primaryKeyParts: ["id"],
});

const useDynamicShardsByVitaIdReader = dynamicShardsReader
  .on(dynamicShardsTable)
  .connect(async (client, user, vitaId) => {
    const { data, error } = await client
      .from("vitas_shards_dynamic")
      .select("*")
      .eq("vita_id", vitaId);

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  })
  .networkKey(vitaId => ["vitaId", vitaId])
  .isSingleRow();

export default useDynamicShardsByVitaIdReader;
