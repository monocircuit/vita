"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/supabase/client";
import { toPascalCase } from "@/utils/case-conversions";
import type {
  NormalizedRowFor,
  InsertRowFor,
  UpdateRowFor,
  WriteResult,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Writer Builder
// ─────────────────────────────────────────────────────────────────────────────

export class TanstackWriterBuilder<
  Table extends keyof Database["public"]["Tables"],
  Defaults extends Partial<InsertRowFor<Table>> = {},
> {
  private _primaryKeyParts: (keyof NormalizedRowFor<Table> & string)[] = [
    "id" as any,
  ];
  private _defaults: Defaults = {} as Defaults;
  private _queryBaseKey: () => string[] = () => [this.tableName as string];

  constructor(private readonly tableName: Table) {}

  /**
   * Definiert die Primary Key Teile für die Tabelle.
   * Standard ist ["id"].
   */
  primaryKeyParts(
    ...keys: (keyof NormalizedRowFor<Table> & string)[]
  ): TanstackWriterBuilder<Table, Defaults> {
    this._primaryKeyParts = keys;
    return this;
  }

  /**
   * Setzt Default-Werte die bei jedem Write automatisch hinzugefügt werden.
   * Nützlich für z.B. `userId` bei eigenen Daten.
   */
  withDefaults<D extends Partial<InsertRowFor<Table>>>(
    defaults: D,
  ): TanstackWriterBuilder<Table, D> {
    const builder = new TanstackWriterBuilder<Table, D>(this.tableName);
    builder._primaryKeyParts = this._primaryKeyParts;
    builder._defaults = defaults;
    builder._queryBaseKey = this._queryBaseKey;
    return builder;
  }

  /**
   * Setzt den Base Query Key für Cache-Invalidierung.
   */
  baseKey(fn: () => string[]): this {
    this._queryBaseKey = fn;
    return this;
  }

  /**
   * Baut den Writer Hook.
   */
  build() {
    const tableName = this.tableName;
    const primaryKeyParts = this._primaryKeyParts;
    const defaults = this._defaults;
    const queryBaseKey = this._queryBaseKey;

    type Insert = InsertRowFor<Table>;
    type Update = UpdateRowFor<Table>;
    type Row = NormalizedRowFor<Table>;

    // Input-Typ: Insert ohne defaults oder Update mit PK
    type InputWithoutDefaults = Omit<Insert, keyof Defaults>;
    type InputWithDefaults = InputWithoutDefaults & Partial<Defaults>;

    return function useWriter() {
      const queryClient = useQueryClient();

      const mutation = useMutation({
        mutationFn: async (
          inputs: InputWithDefaults[],
        ): Promise<WriteResult<Row>> => {
          const client = createClient();

          // Auth check
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();

          if (userError) throw userError;
          if (!user) throw new Error("No user logged in");

          // Lazy load denormalizer schema
          const mod = await import("@/shared/supabase/schemas");
          const runtimeSchemas = (mod as any).$Schemas as Record<string, any>;
          const schemaKey = toPascalCase(tableName as string);
          const schemaEntry = runtimeSchemas[schemaKey];

          if (!schemaEntry?.Denormalize) {
            throw new Error(
              `TanstackWriter: Kein Denormalize-Schema für "${String(tableName)}" gefunden`,
            );
          }

          const denormalize = schemaEntry.Denormalize;

          // Merge defaults und teile in inserts/updates auf
          const inserts: Record<string, unknown>[] = [];
          const updates: {
            data: Record<string, unknown>;
            pk: Record<string, unknown>;
          }[] = [];

          for (const input of inputs) {
            // Merge mit defaults
            const merged = { ...defaults, ...input } as Insert;

            // Denormalize für DB-Format
            const denormalized = denormalize.parse(merged);

            // Prüfe ob alle PK-Teile vorhanden sind
            const hasPk = primaryKeyParts.every(
              key => key in merged && (merged as any)[key] != null,
            );

            if (hasPk) {
              // Update: Extrahiere PK für WHERE clause
              const pk: Record<string, unknown> = {};
              for (const key of primaryKeyParts) {
                pk[key] = denormalized[key];
              }
              updates.push({ data: denormalized, pk });
            } else {
              // Insert: Ohne PK oder mit partieller PK
              inserts.push(denormalized);
            }
          }

          const result: WriteResult<Row> = {
            inserted: [],
            updated: [],
          };

          // Führe Inserts aus
          if (inserts.length > 0) {
            const { data, error } = await client
              .from(tableName as string)
              .insert(inserts)
              .select("*");

            if (error) throw error;

            // Normalize zurück für Cache
            const normalize = schemaEntry.Normalize;
            result.inserted = (data ?? []).map((row: any) =>
              normalize.parse(row),
            );
          }

          // Führe Updates aus (einzeln, da verschiedene PKs)
          for (const { data: updateData, pk } of updates) {
            let query = client.from(tableName as string).update(updateData);

            // Baue WHERE clause für alle PK-Teile
            for (const [key, value] of Object.entries(pk)) {
              query = query.eq(key, value as any);
            }

            const { data, error } = await query.select("*").single();

            if (error) throw error;

            // Normalize zurück für Cache
            const normalize = schemaEntry.Normalize;
            result.updated.push(normalize.parse(data));
          }

          return result;
        },

        onSuccess: result => {
          // Invalidiere relevante Queries
          queryClient.invalidateQueries({
            queryKey: ["net", "public", ...queryBaseKey()],
          });

          // Update depot entries für inserted/updated rows
          const allRows = [...result.inserted, ...result.updated];
          for (const row of allRows) {
            const pk = primaryKeyParts.map(key => (row as any)[key]);
            const depotKey = ["dpt", "public", ...queryBaseKey(), ...pk];
            queryClient.setQueryData(depotKey, row);
          }
        },
      });

      return {
        /**
         * Schreibt eine einzelne Row (insert oder update)
         */
        write: (input: InputWithDefaults) => mutation.mutateAsync([input]),

        /**
         * Schreibt mehrere Rows (inserts und/oder updates)
         */
        writeMany: (inputs: InputWithDefaults[]) =>
          mutation.mutateAsync(inputs),

        /**
         * Die zugrundeliegende Mutation für erweiterte Kontrolle
         */
        mutation,
      };
    };
  }
}
