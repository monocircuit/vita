"use client";

import { oTChronicle } from "@/shared/supabase/tables/chronicles";
import { createDataReader } from "@/shared/supabase/createDataReader";
import { $Chronicles } from "../map";

const useChroniclesByUserId = createDataReader<oTChronicle, [userid: string]>({
  async fetch(client, _currentUser, userid) {
    const { data, error } = await client
      .from("chronicles")
      .select("*")
      .eq("user_id", userid);

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  },

  normalizer: $Chronicles.Normalize,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["chronicles"],
  queryNetworkKey: userid => ["userid", userid],
});

export default useChroniclesByUserId;
