"use client";

import { sqlToZodMap } from "@/utils/sqlToZod";
import { createClient } from "../../supabase/client";
import { keysToCamelCase } from "@/utils/case-conversions";

export interface ColumnMetaData {
  columnName: string;
  columnDescription: string | null;

  // SQL-Typ oder User-Defined-Type
  dataType: keyof typeof sqlToZodMap | "USER-DEFINED" | "ARRAY";

  characterMaximumLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;

  isNullable: boolean;
  maxArrayLength: number | null;

  // UDT (ENUM/DOMAIN/etc.)
  udtName: keyof typeof sqlToZodMap;
  udtSchema: string | null;

  udtInfo: {
    kind: "enum" | "domain" | "composite" | "other";
    name: string;
    schema: string;
    labels: string[] | null; // nur enum
    baseType: string | null; // nur domain
  } | null;
}

/**
 * Ruft die Metadaten der Spalten einer Tabelle ab, einschließlich:
 * - Spaltenname
 * - Datentyp
 * - Maximale Länge (für Zeichenketten)
 * - Präzision und Skalierung (für numerische Felder)
 *
 * @param tableName Der Name der Tabelle, deren Spaltenmetadaten abgerufen werden
 * @returns Ein Array von Objekten mit den Metadaten der Spalten
 */
async function fetchColumnMetaData(
  tableName: string,
): Promise<ColumnMetaData[]> {
  const client = createClient();

  // SQL-Abfrage, um die Metadaten der Spalten zu holen
  const { data, error } = await client.rpc("get_column_metadata", {
    table_name: tableName,
  });

  if (error) {
    console.error("Fehler beim Abrufen der Spaltenmetadaten:", error.message);
    throw new Error(error.message);
  }

  return data.map((row: any) => keysToCamelCase(row)) as any;
}

export default fetchColumnMetaData;
