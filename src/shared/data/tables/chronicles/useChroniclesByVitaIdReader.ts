"use client";

import { TanstackReader } from "@/shared/data/tanstack";
import { chroniclesTable } from "./table";

const chroniclesReader = TanstackReader.Table.withArgs<[vitaId: string]>();

const useChroniclesByVitaIdReader = chroniclesReader
  .on(chroniclesTable)
  .connect(async (client, _currentUser, vitaId) => {
    const numericVitaId = Number(vitaId);
    if (!Number.isFinite(numericVitaId)) return null;

    const { data: shardRows, error: shardError } = await client
      .from("vitas_shards_dynamic")
      .select("chronicle_id")
      .eq("vita_id", numericVitaId);

    if (shardError) throw shardError;
    if (!shardRows || shardRows.length === 0) return null;

    const chronicleIds = Array.from(
      new Set(
        (shardRows as Array<{ chronicle_id: number | null }>)
          .map(row => row.chronicle_id)
          .filter((id): id is number => typeof id === "number" && Number.isFinite(id)),
      ),
    );

    if (chronicleIds.length === 0) return null;

    const { data, error } = await client
      .from("chronicles")
      .select("*")
      .in("id", chronicleIds);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data;
  })
  .networkKey(vitaId => ["vitaId", vitaId])
  .build();

export default useChroniclesByVitaIdReader;
