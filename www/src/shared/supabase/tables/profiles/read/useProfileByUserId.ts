"use client";

import { TanstackReader } from "@/shared/tanstack/reader";

const useProfileByUserId = TanstackReader.withArgs<[userId: string]>()
  .create("profiles")
  .fetcher(async (client, _currentUser, userId) => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return [data];
  })
  .primaryKeyParts("id")
  .networkKey((userId) => ["userId", userId])
  .isSingleRow();

export default useProfileByUserId;
