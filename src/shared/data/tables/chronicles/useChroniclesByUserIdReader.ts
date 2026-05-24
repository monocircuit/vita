"use client";

import { TanstackReader } from "@/shared/data/tanstack";
import { chroniclesTable } from "./table";

const chroniclesReader = TanstackReader.Table.withArgs<[userId: string]>();

const useChroniclesByUserIdReader = chroniclesReader
  .on(chroniclesTable)
  .connect(async (client, _currentUser, userid) => {
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

export default useChroniclesByUserIdReader;
