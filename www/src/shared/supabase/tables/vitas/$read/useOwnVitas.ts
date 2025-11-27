"use client";

import { createDataReader } from "@/shared/supabase/createDataReader";
import { $Vitas, Vitas } from "../map";

const useOwnVitas = createDataReader<Vitas["Normalized"]>({
  async fetch(client, user) {
    const { data, error } = await client
      .from("vitas")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return data;
  },
  normalizer: $Vitas.Normalize,
  primaryKeyParts: ["id"],

  queryBaseKey: () => ["vitas"],
  queryNetworkKey: () => ["own"],

  isSingleRow: false,
});

export default useOwnVitas;
