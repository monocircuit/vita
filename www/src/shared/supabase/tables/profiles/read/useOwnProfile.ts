"use client";

import { oTProfile } from "@/shared/supabase/tables/profiles/mapping";
import { createDataReader } from "@/shared/supabase/createDataReader";
import { normalizeProfile } from "../normalization";

const useOwnProfile = createDataReader<oTProfile>({
  async fetch(client, user) {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return [data];
  },

  normalize: normalizeProfile,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["profiles"],
  queryNetworkKey: () => ["own"],

  isSingleRow: true,
});

export default useOwnProfile;
