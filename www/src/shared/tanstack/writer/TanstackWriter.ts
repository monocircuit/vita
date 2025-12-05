"use client";

import { TanstackWriterBuilder } from "./TanstackWriterBuilder";
import type { InsertRowFor } from "./types";

/**
 * TanstackWriter: Fluent API zum Erstellen typsicherer Supabase Write-Hooks.
 *
 * @example
 * ```ts
 * // Basis-Writer für chronicles
 * const useWriteChronicles = TanstackWriter
 *   .create("chronicles")
 *   .primaryKeyParts("id")
 *   .build();
 *
 * // Writer mit Default-Werten (z.B. für eigene Daten)
 * const useWriteOwnChronicles = TanstackWriter
 *   .create("chronicles")
 *   .primaryKeyParts("id")
 *   .withDefaults({ user_id: currentUserId })
 *   .build();
 *
 * // Verwendung im Component:
 * const { write, writeMany, mutation } = useWriteChronicles();
 *
 * // Single insert (ohne id → insert)
 * await write({ title: "Neue Chronicle", knots: [], category: "work" });
 *
 * // Single update (mit id → update)
 * await write({ id: 123, title: "Updated Title" });
 *
 * // Bulk write (mix aus inserts und updates)
 * await writeMany([
 *   { title: "New One", knots: [], category: "work" },
 *   { id: 456, title: "Update Existing" },
 * ]);
 * ```
 */
export const TanstackWriter = {
  /**
   * Erstellt einen neuen Writer für die angegebene Tabelle.
   * Akzeptiert camelCase Tabellennamen und konvertiert intern zu snake_case.
   */
  create<Table extends keyof Database["public"]["Tables"]>(
    tableName: Table,
  ): TanstackWriterBuilder<Table> {
    return new TanstackWriterBuilder(tableName);
  },

  /**
   * Erstellt einen Writer mit vordefinierten Default-Werten.
   * Nützlich für Hooks die immer bestimmte Spalten setzen.
   *
   * @example
   * ```ts
   * const useWriteOwnChronicles = TanstackWriter
   *   .withDefaults<"chronicles">()({ user_id: userId })
   *   .primaryKeyParts("id")
   *   .build();
   * ```
   */
  withDefaults<Table extends keyof Database["public"]["Tables"]>() {
    return <D extends Partial<InsertRowFor<Table>>>(defaults: D) => {
      return new TanstackWriterBuilder<Table, D>(
        "" as Table, // wird überschrieben
      ).withDefaults(defaults);
    };
  },
};

export default TanstackWriter;
