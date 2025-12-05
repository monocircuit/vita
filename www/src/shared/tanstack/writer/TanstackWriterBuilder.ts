"use client";

import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/shared/supabase/client";
import {
  keysToCamelCase,
  toPascalCase,
  toSnakeCase,
} from "@/utils/case-conversions";
import type { Camelize } from "@/utils/case-conversions/types";
import type { NormalizedRowFor, InsertRowFor, WriteResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Writer Builder
// ─────────────────────────────────────────────────────────────────────────────

export class TanstackWriterBuilder<
  Table extends keyof Database["public"]["Tables"],
  Defaults extends Partial<Camelize<InsertRowFor<Table>>> = {},
> {
  private _primaryKeyParts: (keyof NormalizedRowFor<Table> & string)[] = [
    "id" as any,
  ];
  private _defaults: Defaults = {} as Defaults;
  private _queryBaseKey: () => string[] = () => [this.tableName as string];
  private _conflictParts?: (keyof NormalizedRowFor<Table> & string)[];

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
  withDefaults<D extends Partial<Camelize<InsertRowFor<Table>>>>(
    defaults: D,
  ): TanstackWriterBuilder<Table, D> {
    const builder = new TanstackWriterBuilder<Table, D>(this.tableName);
    builder._primaryKeyParts = this._primaryKeyParts;
    builder._defaults = defaults;
    builder._queryBaseKey = this._queryBaseKey;
    builder._conflictParts = this._conflictParts;
    return builder;
  }

  /**
   * Setzt den Base Query Key für Cache-Invalidierung.
   */
  baseKey(fn: () => string[]): this {
    this._queryBaseKey = fn;
    return this;
  }

  conflictOn(
    ...keys: (keyof NormalizedRowFor<Table> & string)[]
  ): TanstackWriterBuilder<Table, Defaults> {
    this._conflictParts = keys;
    return this;
  }

  /**
   * Baut den Writer Hook.
   */
  build() {
    const tableName = this.tableName;
    const primaryKeyParts = this._primaryKeyParts;
    const buildTimeDefaults = this._defaults;
    const conflictPartsDefault = this._conflictParts;
    const queryBaseKey = this._queryBaseKey;

    type Insert = InsertRowFor<Table>;
    type CamelInsert = Camelize<Insert>;
    type Row = NormalizedRowFor<Table>;
    type CamelRow = Camelize<Row>;

    // Writer Instance Type mit akkumulierten Defaults
    interface WriterInstance<AccumulatedDefaults extends Partial<CamelInsert>> {
      /**
       * Schreibt eine oder mehrere Rows (insert oder update via upsert).
       * Erkennt automatisch ob ein Array übergeben wurde.
       */
      write: (
        input:
          | (Omit<CamelInsert, keyof AccumulatedDefaults> &
              Partial<AccumulatedDefaults>)
          | (Omit<CamelInsert, keyof AccumulatedDefaults> &
              Partial<AccumulatedDefaults>)[],
      ) => Promise<WriteResult<CamelRow>>;

      /**
       * Die zugrundeliegende Mutation für erweiterte Kontrolle
       */
      mutation: UseMutationResult<
        WriteResult<CamelRow>,
        Error,
        unknown[],
        unknown
      >;

      /**
       * Setzt Default-Werte und gibt einen neuen Writer mit aktualisierten Types zurück.
       * Die gesetzten Keys werden aus dem Input-Type von write() entfernt.
       */
      setDefaults: <NewDefaults extends Partial<CamelInsert>>(
        newDefaults: NewDefaults,
      ) => WriterInstance<AccumulatedDefaults & NewDefaults>;
    }

    // Shared state zwischen Writer-Instanzen (wird im Hook initialisiert)
    let runtimeDefaults: Partial<CamelInsert> = { ...buildTimeDefaults };
    let queryClientRef: ReturnType<typeof useQueryClient>;
    let mutationRef: UseMutationResult<
      WriteResult<CamelRow>,
      Error,
      unknown[],
      unknown
    >;

    // Factory-Funktion um typisierte Writer-Instanzen zu erstellen
    function createWriterInstance<
      AccumulatedDefaults extends Partial<CamelInsert>,
    >(): WriterInstance<AccumulatedDefaults> {
      return {
        write: (input: unknown) =>
          Array.isArray(input)
            ? mutationRef.mutateAsync(input)
            : mutationRef.mutateAsync([input]),

        mutation: mutationRef,

        setDefaults: <NewDefaults extends Partial<CamelInsert>>(
          newDefaults: NewDefaults,
        ): WriterInstance<AccumulatedDefaults & NewDefaults> => {
          runtimeDefaults = { ...runtimeDefaults, ...newDefaults };
          return createWriterInstance<AccumulatedDefaults & NewDefaults>();
        },
      };
    }

    return function useWriter(): WriterInstance<Defaults> {
      queryClientRef = useQueryClient();

      mutationRef = useMutation({
        mutationFn: async (
          inputs: unknown[],
        ): Promise<WriteResult<CamelRow>> => {
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
          const normalize = schemaEntry.Normalize;

          // Merge defaults und denormalize alle Inputs
          const rows: Record<string, unknown>[] = inputs.map(input => {
            const mergedCamel = {
              ...runtimeDefaults,
              ...(input as object),
            } as CamelInsert;
            return denormalize.parse(mergedCamel);
          });

          const conflictParts = conflictPartsDefault ?? primaryKeyParts;
          if (!conflictParts.length) {
            throw new Error(
              `TanstackWriter: Kein ON CONFLICT für "${String(tableName)}" definiert`,
            );
          }

          const onConflictColumns = conflictParts
            .map(key => toSnakeCase(String(key)))
            .join(",");

          const { data, error } = await client
            .from(tableName as string)
            .upsert(rows, {
              onConflict: onConflictColumns,
              ignoreDuplicates: false, // Bei Konflikt: Update statt ignorieren
            })
            .select("*");

          if (error) throw error;

          // Normalize zurück für Cache
          const normalizedRows: Row[] = (data ?? []).map((row: any) =>
            normalize.parse(row),
          );

          const camelRows: CamelRow[] = keysToCamelCase(normalizedRows);
          return { rows: camelRows };
        },

        onSuccess: result => {
          console.log(["net", "public", ...queryBaseKey()], "writer:onSuccess");
          // Invalidiere relevante Queries
          queryClientRef.invalidateQueries({
            queryKey: ["net", "public", ...queryBaseKey()],
          });

          // Update depot entries für alle upserted rows
          for (const row of result.rows) {
            const pk = primaryKeyParts.map(key => (row as any)[key]);
            const depotKey = ["dpt", "public", ...queryBaseKey(), ...pk];
            queryClientRef.setQueryData(depotKey, row);
          }
        },
      });

      return createWriterInstance<Defaults>();
    };
  }
}
