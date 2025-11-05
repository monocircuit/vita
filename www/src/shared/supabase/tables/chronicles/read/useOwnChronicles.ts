"use client";

import { oTChronicle } from "@/shared/supabase/tables/chronicles";
import { createDataReader } from "@/shared/supabase/createDataReader";
import { normalizeChronicle } from "../normalization";

const useOwnChronicles = createDataReader<oTChronicle>({
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

  normalize: normalizeChronicle,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["chronicles"],
  queryNetworkKey: () => ["own"],

  isSingleRow: false,
});

export default useOwnChronicles;
