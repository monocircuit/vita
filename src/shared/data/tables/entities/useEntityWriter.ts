import { TanstackWriter } from "@/shared/data/tanstack";

/**
 * Writer hook for storing entities.
 */
const entitiesTable = TanstackWriter.table("entities", {
  primaryKeyParts: ["id"],
  baseKey: () => ["entities"],
});

const useEntityWriter = TanstackWriter.on(entitiesTable).connect(
  async ({ client, tableName, rows }) => {
    const rowsWithDomain = rows.filter(row => {
      const domain = row["domain"];
      return typeof domain === "string" && domain.trim().length > 0;
    });

    const rowsWithoutDomain = rows.filter(row => {
      const domain = row["domain"];
      return !(typeof domain === "string" && domain.trim().length > 0);
    });

    const persistedRows: Record<string, unknown>[] = [];

    if (rowsWithDomain.length > 0) {
      const { data, error } = await client
        .from(tableName as string)
        .upsert(rowsWithDomain, {
          onConflict: "domain",
          ignoreDuplicates: false,
        })
        .select("*");

      if (error) throw error;
      if (Array.isArray(data)) persistedRows.push(...data);
    }

    if (rowsWithoutDomain.length > 0) {
      const { data, error } = await client
        .from(tableName as string)
        .insert(rowsWithoutDomain)
        .select("*");

      if (error) throw error;
      if (Array.isArray(data)) persistedRows.push(...data);
    }

    return persistedRows;
  },
);

export default useEntityWriter;
