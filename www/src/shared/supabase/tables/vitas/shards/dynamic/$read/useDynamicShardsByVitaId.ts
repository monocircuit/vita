"use client";

import { oTVitaShardDynamic } from "@/shared/supabase/tables/vitas/shards/dynamic";
import { createDataReader } from "@/shared/supabase/createDataReader";
import { $VitasShardsDynamic, VitasShardsDynamic } from "../map";

const useDynamicShardsByVitaId = createDataReader<
  VitasShardsDynamic["Normalized"],
  [vitaId: string]
>({
  async fetch(client, _user, vitaId) {
    const { data, error } = await client
      .from("vitas_shards_dynamic")
      .select("*")
      .eq("vita_id", vitaId);

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  },

  dataSchema: $VitasShardsDynamic.Normalized,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["vitas", "shards", "dynamic"],
  queryNetworkKey: vitaId => ["vitaId", vitaId],

  isSingleRow: false,
});

export default useDynamicShardsByVitaId;
