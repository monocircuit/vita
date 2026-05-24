"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  keysToCamelCase,
  toPascalCase,
  toSnakeCase,
  type KeysToCamelCase,
} from "@/vendor/utilities/functions";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import {
  getTanstackAdapter,
  getTanstackClient,
  getTanstackSchemas,
} from "../config";
import { emitTanstackMutationEvent } from "../events";
import type {
  InsertRowFor,
  NormalizedRowFor,
  WriteResult,
  WriterConnector,
  WriterInstance,
} from "./types";

export class TanstackWriterBuilder<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
  Defaults extends Partial<KeysToCamelCase<InsertRowFor<DB, Table>>> = {},
> {
  private _primaryKeyParts: (keyof NormalizedRowFor<DB, Schemas, Table> &
    string)[] = ["id" as any];
  private _defaults: Defaults = {} as Defaults;
  private _queryBaseKey: () => string[] = () => [this.tableName as string];
  private _conflictParts?: (keyof NormalizedRowFor<DB, Schemas, Table> &
    string)[];
  private _connector?: WriterConnector<Table>;

  constructor(private readonly tableName: Table) {}

  primaryKeyParts(
    ...keys: (keyof NormalizedRowFor<DB, Schemas, Table> & string)[]
  ): TanstackWriterBuilder<DB, Schemas, Table, Defaults> {
    this._primaryKeyParts = keys;
    return this;
  }

  withDefaults<D extends Partial<KeysToCamelCase<InsertRowFor<DB, Table>>>>(
    defaults: D,
  ): TanstackWriterBuilder<DB, Schemas, Table, D> {
    const builder = new TanstackWriterBuilder<DB, Schemas, Table, D>(
      this.tableName,
    );
    builder._primaryKeyParts = this._primaryKeyParts;
    builder._defaults = defaults;
    builder._queryBaseKey = this._queryBaseKey;
    builder._conflictParts = this._conflictParts;
    builder._connector = this._connector;
    return builder;
  }

  baseKey(fn: () => string[]): this {
    this._queryBaseKey = fn;
    return this;
  }

  conflictOn(
    ...keys: (keyof NormalizedRowFor<DB, Schemas, Table> & string)[]
  ): TanstackWriterBuilder<DB, Schemas, Table, Defaults> {
    this._conflictParts = keys;
    return this;
  }

  connector(
    fn: WriterConnector<Table>,
  ): TanstackWriterBuilder<DB, Schemas, Table, Defaults> {
    this._connector = fn;
    return this;
  }

  build(): () => WriterInstance<
    KeysToCamelCase<InsertRowFor<DB, Table>>,
    KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>,
    Defaults
  > {
    const tableName = this.tableName;
    const primaryKeyParts = this._primaryKeyParts;
    const buildTimeDefaults = this._defaults;
    const conflictPartsDefault = this._conflictParts;
    const queryBaseKey = this._queryBaseKey;
    const customConnector = this._connector;

    type Insert = InsertRowFor<DB, Table>;
    type CamelInsert = KeysToCamelCase<Insert>;
    type Row = NormalizedRowFor<DB, Schemas, Table>;
    type CamelRow = KeysToCamelCase<Row>;

    let runtimeDefaults: Partial<CamelInsert> = { ...buildTimeDefaults };
    let queryClientRef: ReturnType<typeof useQueryClient>;
    let mutationRef: UseMutationResult<
      WriteResult<CamelRow>,
      Error,
      unknown[],
      unknown
    >;

    function createWriterInstance<
      AccumulatedDefaults extends Partial<CamelInsert>,
    >(): WriterInstance<CamelInsert, CamelRow, AccumulatedDefaults> {
      return {
        write: (input: unknown) =>
          Array.isArray(input)
            ? mutationRef.mutateAsync(input)
            : mutationRef.mutateAsync([input]),
        mutation: mutationRef,
        setDefaults: <NewDefaults extends Partial<CamelInsert>>(
          newDefaults: NewDefaults,
        ): WriterInstance<
          CamelInsert,
          CamelRow,
          AccumulatedDefaults & NewDefaults
        > => {
          runtimeDefaults = { ...runtimeDefaults, ...newDefaults };
          return createWriterInstance<AccumulatedDefaults & NewDefaults>();
        },
      };
    }

    return function useWriter(): WriterInstance<
      CamelInsert,
      CamelRow,
      Defaults
    > {
      queryClientRef = useQueryClient();

      mutationRef = useMutation({
        mutationFn: async (
          inputs: unknown[],
        ): Promise<WriteResult<CamelRow>> => {
          const client = getTanstackClient();
          const adapter = getTanstackAdapter();

          const { user, error: userError } = await adapter.getUser(client);

          if (userError) throw userError;
          if (!user) throw new Error("No user logged in");

          const runtimeSchemas = await getTanstackSchemas();
          const schemaKey = toPascalCase(tableName as string);
          const schemaEntry = runtimeSchemas[schemaKey];

          if (!schemaEntry?.Denormalize) {
            throw new Error(
              `TanstackWriter: Kein Denormalize-Schema für \"${String(tableName)}\" gefunden`,
            );
          }

          const denormalize = schemaEntry.Denormalize;
          const normalize = schemaEntry.Normalize;

          const rows: Record<string, unknown>[] = inputs.map(input => {
            const mergedCamel = {
              ...runtimeDefaults,
              ...(input as object),
            } as CamelInsert;
            return denormalize.parse(mergedCamel) as Record<string, unknown>;
          });

          const conflictParts = conflictPartsDefault ?? primaryKeyParts;
          if (!conflictParts.length) {
            throw new Error(
              `TanstackWriter: Kein ON CONFLICT für \"${String(tableName)}\" definiert`,
            );
          }

          const onConflictColumns = conflictParts
            .map(key => toSnakeCase(String(key)))
            .join(",");

          const sanitizedRows = rows.map(row => {
            const next: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(row)) {
              if (value !== undefined) next[key] = value;
            }
            return next;
          });

          const hasAllConflictValues = (row: Record<string, unknown>) => {
            return conflictParts.every(part => {
              const key = toSnakeCase(String(part));
              const value = row[key];
              return value !== undefined && value !== null;
            });
          };

          const rowsForUpsert = sanitizedRows.filter(hasAllConflictValues);
          const rowsForInsert = sanitizedRows.filter(
            row => !hasAllConflictValues(row),
          );

          const tableRef = client.from(tableName as string) as any;
          let persistedRows: Record<string, unknown>[] = [];

          if (customConnector) {
            const customResult = await customConnector({
              client,
              user,
              tableName,
              rows: sanitizedRows,
              primaryKeyParts: primaryKeyParts.map(String),
              conflictParts: conflictParts.map(String),
            });
            persistedRows = Array.isArray(customResult) ? customResult : [];
          } else {
            if (rowsForInsert.length > 0) {
              const { data: insertedData, error: insertError } = await tableRef
                .insert(rowsForInsert)
                .select("*");

              if (insertError) throw insertError;
              if (Array.isArray(insertedData)) {
                persistedRows.push(...insertedData);
              }
            }

            if (rowsForUpsert.length > 0) {
              const { data: upsertedData, error: upsertError } = await tableRef
                .upsert(rowsForUpsert, {
                  onConflict: onConflictColumns,
                  ignoreDuplicates: false,
                })
                .select("*");

              if (upsertError) throw upsertError;
              if (Array.isArray(upsertedData)) {
                persistedRows.push(...upsertedData);
              }
            }
          }

          const normalizedRows: Row[] = persistedRows.map((row: any) =>
            normalize?.parse ? normalize.parse(row) : row,
          );

          const camelRows: CamelRow[] = keysToCamelCase(normalizedRows);
          return { rows: camelRows };
        },

        onSuccess: (result: WriteResult<CamelRow>) => {
          emitTanstackMutationEvent({
            kind: "write-success",
            tableName: String(tableName),
            queryBaseKey: queryBaseKey(),
            address: ["net", "public", ...queryBaseKey()],
            primaryKeyParts: primaryKeyParts.map(String),
            rows: result.rows as Record<string, unknown>[],
            occurredAt: Date.now(),
          });

          queryClientRef.invalidateQueries({
            queryKey: ["net", "public", ...queryBaseKey()],
          });

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
