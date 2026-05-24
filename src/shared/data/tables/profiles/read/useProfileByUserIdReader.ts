"use client";

import { TanstackReader } from "@/shared/data/tanstack";

const profilesReader = TanstackReader.Table.withArgs<[userId: string]>();

const profilesTable = profilesReader.table("profiles", {
  primaryKeyParts: ["id"],
});

const useProfileByUserIdReader = profilesReader
  .on(profilesTable)
  .connect(async (client, _currentUser, userId) => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return [data];
  })
  .networkKey(userId => ["userId", userId])
  .isSingleRow();

export default useProfileByUserIdReader;
