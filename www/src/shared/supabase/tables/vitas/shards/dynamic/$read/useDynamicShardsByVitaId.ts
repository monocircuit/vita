"use client";

import { oTVitaShardDynamic } from "@/shared/supabase/tables/vitas/shards/dynamic";
import { createDataReader } from "@/shared/supabase/createDataReader";
import { normalizeDynamicShard } from "../normalization";

type Args = [vitaId: string];

const useDynamicShardsByVitaId = createDataReader<oTVitaShardDynamic, Args>({
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

  normalize: normalizeDynamicShard,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["vitas", "shards", "dynamic"],
  queryNetworkKey: vitaId => ["vitaId", vitaId],

  isSingleRow: false,
});

export default useDynamicShardsByVitaId;
