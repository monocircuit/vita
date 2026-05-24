"use client";

import { keysToCamelCase, sqlToZodMap } from "@/vendor/utilities/functions";
import { getBridgeClient } from "../client";

export interface ColumnMetaData {
  columnName: string;
  columnDescription: string | null;

  // SQL type or user-defined type
  dataType: keyof typeof sqlToZodMap | "USER-DEFINED" | "ARRAY";

  characterMaximumLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;

  isNullable: boolean;
  maxArrayLength: number | null;

  // UDT (enum/domain/composite/etc.)
  udtName: keyof typeof sqlToZodMap;
  udtSchema: string | null;

  udtInfo: {
    kind: "enum" | "domain" | "composite" | "other";
    name: string;
    schema: string;
    labels: string[] | null; // enum only
    baseType: string | null; // domain only
  } | null;
}

/**
 * Fetches column metadata for a table through the host application's RPC.
 *
 * Includes:
 * - column name
 * - SQL/UDT data type
 * - max length for character fields
 * - numeric precision/scale metadata
 *
 * @param tableName Database table name.
 * @returns Array of normalized column metadata objects.
 */
async function fetchColumnMetaData(
  tableName: string,
): Promise<ColumnMetaData[]> {
  const client = getBridgeClient();

  // RPC query that returns column metadata rows.
  const { data, error } = await client.rpc("get_column_metadata", {
    table_name: tableName,
  });

  if (error) {
    throw new Error(
      `Failed to fetch column metadata for table \"${tableName}\": ${error.message}`,
    );
  }

  return data.map((row: any) => keysToCamelCase(row)) as any;
}

export default fetchColumnMetaData;
