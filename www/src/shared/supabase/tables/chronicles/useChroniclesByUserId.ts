"use client";

import { TanstackReader } from "@/shared/tanstack/reader/TanstackReader";

const useChroniclesByUserId = TanstackReader.withArgs<[userId: string]>()
  .create("chronicles")
  .fetcher(async (client, _currentUser, userid) => {
    const { data, error } = await client
      .from("chronicles")
      .select("*")
      .eq("user_id", userid);

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  })
  .networkKey(userId => ["userId", userId])
  .build();

export default useChroniclesByUserId;
