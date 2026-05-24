"use client";

import { TanstackDeleter } from "@/shared/data/tanstack";
import { chroniclesTable } from "./table";

/**
 * Deleter hook for deleting chronicles by id.
 */
const useChronicleByIdDeleter = TanstackDeleter.on(chroniclesTable).connect(
  async ({ client, rows }) => {
    const chronicleIds = rows
      .map(row => row.id)
      .filter((value): value is number => Number.isFinite(value));

    if (chronicleIds.length === 0) {
      return [];
    }

    const dependentDeletes = [
      client
        .from("chronicle_entities")
        .delete()
        .in("chronicle_id", chronicleIds),
      client
        .from("chronicles_relations")
        .delete()
        .in("chronicle_id", chronicleIds),
      client
        .from("dynamic_vita_paths")
        .delete()
        .in("chronicle_id", chronicleIds),
      client
        .from("vitas_shards_dynamic")
        .delete()
        .in("chronicle_id", chronicleIds),
    ];

    for (const result of dependentDeletes) {
      const { error } = await result;
      if (error) {
        throw error;
      }
    }

    const { data: deletedRows, error: chronicleError } = await client
      .from("chronicles")
      .delete()
      .in("id", chronicleIds)
      .select("*");

    if (chronicleError) {
      throw chronicleError;
    }

    return Array.isArray(deletedRows) ? deletedRows : [];
  },
);

export default useChronicleByIdDeleter;
