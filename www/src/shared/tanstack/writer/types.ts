"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { Schemas } from "@/shared/supabase/schemas";
import type { Pascalize } from "@/utils/case-conversions/types";

// ─────────────────────────────────────────────────────────────────────────────
// Database Type Helpers
// ─────────────────────────────────────────────────────────────────────────────

export type SchemaKeyFor<Table extends keyof Database["public"]["Tables"]> =
  `${Pascalize<Table>}` & keyof Schemas;

export type NormalizedRowFor<Table extends keyof Database["public"]["Tables"]> =
  Schemas[SchemaKeyFor<Table>]["Normalized"] & object;

export type RawRowFor<Table extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Table]["Row"];

export type InsertRowFor<Table extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Table]["Insert"];

export type UpdateRowFor<Table extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Table]["Update"];

// ─────────────────────────────────────────────────────────────────────────────
// Writer Input Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input für den Writer: Kann entweder ein Insert (ohne vollständigen PK)
 * oder ein Update (mit vollständigem PK) sein.
 *
 * - Insert: Partial primary key oder fehlend → CREATE
 * - Update: Vollständiger primary key → UPDATE
 */
export type WriteInput<
  Insert extends object,
  Update extends object,
  PrimaryKey extends keyof Insert & keyof Update,
> =
  | (Omit<Insert, PrimaryKey> & Partial<Pick<Insert, PrimaryKey>>) // Insert ohne/mit optionalem PK
  | (Update & Required<Pick<Update, PrimaryKey>>); // Update mit required PK

/**
 * Prüft ob ein Input alle Primary Key Teile hat (→ Update) oder nicht (→ Insert)
 */
export function hasFullPrimaryKey<T extends object>(
  input: T,
  primaryKeyParts: (keyof T)[],
): boolean {
  return primaryKeyParts.every(
    key => key in input && input[key] !== undefined && input[key] !== null,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Writer Return Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Das Ergebnis eines Write-Vorgangs enthält die geschriebenen Rows
 * mit allen Feldern (inkl. generierter IDs, timestamps, etc.)
 */
export interface WriteResult<Row> {
  inserted: Row[];
  updated: Row[];
}

export type WriterReturn<Row> = UseMutationResult<
  WriteResult<Row>,
  Error,
  unknown[], // Input kann variieren
  unknown
>;

// ─────────────────────────────────────────────────────────────────────────────
// Writer Hook Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ein DataWriter ist ein React Hook der eine Mutation zurückgibt.
 *
 * Der Hook kann mit `.withDefaults()` vorkonfiguriert werden,
 * um bestimmte Spalten automatisch zu setzen.
 */
export type DataWriter<
  Row extends object,
  Input extends object,
  Defaults extends Partial<Input> = {},
> = () => {
  /**
   * Schreibt eine einzelne Row
   */
  write: (
    input: Omit<Input, keyof Defaults> & Partial<Defaults>,
  ) => Promise<WriteResult<Row>>;

  /**
   * Schreibt mehrere Rows
   */
  writeMany: (
    inputs: (Omit<Input, keyof Defaults> & Partial<Defaults>)[],
  ) => Promise<WriteResult<Row>>;

  /**
   * Die zugrundeliegende Mutation für erweiterte Kontrolle
   */
  mutation: WriterReturn<Row>;
};
