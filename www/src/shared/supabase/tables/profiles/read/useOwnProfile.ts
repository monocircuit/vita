"use client";

import { $Profiles, Profiles } from "@/shared/supabase/tables/profiles/map";
import { createDataReader } from "@/shared/supabase/createDataReader";

const useOwnProfile = createDataReader<Profiles["Normalized"]>({
  async fetch(client, user) {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return [data];
  },

  dataSchema: $Profiles.Normalized,

  primaryKeyParts: ["id"],

  queryBaseKey: () => ["profiles"],
  queryNetworkKey: () => ["own"],

  isSingleRow: true,
});

export default useOwnProfile;
