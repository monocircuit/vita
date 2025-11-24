"use client";

import { createDataReader } from "@/shared/supabase/createDataReader";
import { $Chronicles, Chronicles } from "../map";

const useOwnChronicles = createDataReader<Chronicles["Normalized"]>({
  async fetch(client, user) {
    const { data, error } = await client
      .from("chronicles")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  },

  dataSchema: $Chronicles.Normalized,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["chronicles"],
  queryNetworkKey: () => ["own"],

  isSingleRow: false,
});

export default useOwnChronicles;
