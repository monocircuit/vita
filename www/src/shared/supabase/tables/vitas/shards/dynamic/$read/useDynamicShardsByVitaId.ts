"use client";

import TanstackReader from "@/shared/tanstack/reader/TanstackReader";

const useDynamicShardsByVitaId = TanstackReader.withArgs<[vitaId: string]>()
  .create("vitasShardsDynamic")
  .fetcher(async (client, user, vitaId) => {
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
  .primaryKeyParts("id")
  .isSingleRow();

export default useDynamicShardsByVitaId;
