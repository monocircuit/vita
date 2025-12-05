"use client";

import TanstackReader from "@/shared/tanstack/reader/TanstackReader";

const useVitasByUserId = TanstackReader.withArgs<[userId: string]>()
  .create("vitas")
  .fetcher(async (client, _currentUser, userId) => {
    const { data, error } = await client
      .from("vitas")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return data;
  })
  .networkKey((userId) => ["userId", userId])
  .baseKey(() => ["vitas"])
  .build();

export default useVitasByUserId;
