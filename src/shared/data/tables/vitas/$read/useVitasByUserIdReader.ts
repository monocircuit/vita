"use client";

import TanstackReader from "@/shared/data/tanstack";

const vitasReader = TanstackReader.Table.withArgs<[userId: string]>();

const vitasTable = vitasReader.table("vitas", {
  baseKey: () => ["vitas"],
});

const useVitasByUserIdReader = vitasReader
  .on(vitasTable)
  .connect(async (client, _currentUser, userId) => {
    const { data, error } = await client
      .from("vitas")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return data;
  })
  .networkKey(userId => ["userId", userId])
  .build();

export default useVitasByUserIdReader;
