"use client";

import { createDataReader } from "@/shared/supabase/createDataReader";
import { normalizeVita } from "../normalization";
import { oTVita } from "../mapping";

const useOwnVitas = createDataReader<oTVita>({
  async fetch(client, user) {
    const { data, error } = await client
      .from("vitas")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return data;
  },

  normalize: normalizeVita,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["vitas"],
  queryNetworkKey: () => ["own"],

  isSingleRow: false,
});

export default useOwnVitas;
