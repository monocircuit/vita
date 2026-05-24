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
import type { NormalizedRowFor } from "../writer";
import type {
  DeleterConnector,
  DeleteInput,
  DeleteResult,
  DeleterInstance,
} from "./types";

export class TanstackDeleterBuilder<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
  RequiredKeys extends keyof NormalizedRowFor<DB, Schemas, Table> & string =
    never,
  Defaults extends Partial<KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>> = {},
> {
  private _primaryKeyParts: (keyof NormalizedRowFor<DB, Schemas, Table> &
    string)[] = ["id" as any];
  private _defaults: Defaults = {} as Defaults;
  private _queryBaseKey: () => string[] = () => [this.tableName as string];
  private _connector?: DeleterConnector<Table>;

  constructor(private readonly tableName: Table) {}

  primaryKeyParts(
    ...keys: (keyof NormalizedRowFor<DB, Schemas, Table> & string)[]
  ): TanstackDeleterBuilder<DB, Schemas, Table, RequiredKeys, Defaults> {
    this._primaryKeyParts = keys;
    return this;
  }

  withDefaults<
    D extends Partial<KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>>,
  >(defaults: D): TanstackDeleterBuilder<DB, Schemas, Table, RequiredKeys, D> {
    const builder = new TanstackDeleterBuilder<
      DB,
      Schemas,
      Table,
      RequiredKeys,
      D
    >(this.tableName);
    builder._primaryKeyParts = this._primaryKeyParts;
    builder._defaults = defaults;
    builder._queryBaseKey = this._queryBaseKey;
    builder._connector = this._connector;
    return builder;
  }

  baseKey(fn: () => string[]): this {
    this._queryBaseKey = fn;
    return this;
  }

  connector(
    fn: DeleterConnector<Table>,
  ): TanstackDeleterBuilder<DB, Schemas, Table, RequiredKeys, Defaults> {
    this._connector = fn;
    return this;
  }

  build(): () => DeleterInstance<
    KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>,
    Defaults,
    Extract<RequiredKeys, keyof KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>>
  > {
    const tableName = this.tableName;
    const primaryKeyParts = this._primaryKeyParts;
    const buildTimeDefaults = this._defaults;
    const queryBaseKey = this._queryBaseKey;
    const customConnector = this._connector;

    type Row = NormalizedRowFor<DB, Schemas, Table>;
    type CamelRow = KeysToCamelCase<Row>;
    type RequiredCamelKeys = Extract<RequiredKeys, keyof CamelRow>;
    type Input = DeleteInput<CamelRow, RequiredCamelKeys>;

    let runtimeDefaults: Partial<CamelRow> = { ...buildTimeDefaults };
    let queryClientRef: ReturnType<typeof useQueryClient>;
    let mutationRef: UseMutationResult<
      DeleteResult<CamelRow>,
      Error,
      Input[],
      unknown
    >;

    function createDeleterInstance<
      AccumulatedDefaults extends Partial<CamelRow>,
    >(): DeleterInstance<CamelRow, AccumulatedDefaults, RequiredCamelKeys> {
      return {
        delete: (input: Input | Input[]) =>
          Array.isArray(input)
            ? mutationRef.mutateAsync(input)
            : mutationRef.mutateAsync([input]),
        mutation: mutationRef,
        setDefaults: <NewDefaults extends Partial<CamelRow>>(
          newDefaults: NewDefaults,
        ): DeleterInstance<
          CamelRow,
          AccumulatedDefaults & NewDefaults,
          RequiredCamelKeys
        > => {
          runtimeDefaults = { ...runtimeDefaults, ...newDefaults };
          return createDeleterInstance<AccumulatedDefaults & NewDefaults>();
        },
      };
    }

    return function useDeleter(): DeleterInstance<
      CamelRow,
      Defaults,
      RequiredCamelKeys
    > {
      queryClientRef = useQueryClient();

      mutationRef = useMutation({
        mutationFn: async (
          inputs: Input[],
        ): Promise<DeleteResult<CamelRow>> => {
          const client = getTanstackClient();
          const adapter = getTanstackAdapter();

          const { user, error: userError } = await adapter.getUser(client);

          if (userError) throw userError;
          if (!user) throw new Error("No user logged in");

          const runtimeSchemas = await getTanstackSchemas();
          const schemaKey = toPascalCase(tableName as string);
          const schemaEntry = runtimeSchemas[schemaKey];

          if (!schemaEntry?.Normalize) {
            throw new Error(
              `TanstackDeleter: Kein Normalize-Schema fuer \"${String(tableName)}\" gefunden`,
            );
          }

          const normalize = schemaEntry.Normalize;

          const rows: Record<string, unknown>[] = inputs.map(input => {
            const mergedCamel = {
              ...runtimeDefaults,
              ...(input as object),
            } as Partial<CamelRow>;
            return mergedCamel as Record<string, unknown>;
          });

          const sanitizedRows = rows.map(row => {
            const next: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(row)) {
              if (value !== undefined) next[key] = value;
            }
            return next;
          });

          if (sanitizedRows.length === 0) {
            return { rows: [] };
          }

          let persistedRows: Record<string, unknown>[] = [];

          if (customConnector) {
            const customResult = await customConnector({
              client,
              user,
              tableName,
              rows: sanitizedRows,
              primaryKeyParts: primaryKeyParts.map(String),
            });
            persistedRows = Array.isArray(customResult) ? customResult : [];
          } else {
            if (primaryKeyParts.length !== 1) {
              throw new Error(
                `TanstackDeleter: Default connector supports exactly one primary key for \"${String(tableName)}\"`,
              );
            }

            const primaryKey = toSnakeCase(String(primaryKeyParts[0]));
            const ids = sanitizedRows
              .map(row => row[primaryKey])
              .filter(value => value !== undefined && value !== null);

            if (ids.length === 0) {
              return { rows: [] };
            }

            const tableRef = client.from(tableName as string) as any;
            const { data, error } = await tableRef
              .delete()
              .in(primaryKey, ids)
              .select("*");

            if (error) throw error;
            if (Array.isArray(data)) persistedRows = data;
          }

          const normalizedRows: Row[] = persistedRows.map((row: any) =>
            normalize?.parse ? normalize.parse(row) : row,
          );

          const camelRows: CamelRow[] = keysToCamelCase(normalizedRows);
          return { rows: camelRows };
        },

        onSuccess: (result, inputs) => {
          emitTanstackMutationEvent({
            kind: "delete-success",
            tableName: String(tableName),
            queryBaseKey: queryBaseKey(),
            address: ["net", "public", ...queryBaseKey()],
            primaryKeyParts: primaryKeyParts.map(String),
            rows: [
              ...(result.rows as Record<string, unknown>[]),
              ...(inputs as Record<string, unknown>[]),
            ],
            occurredAt: Date.now(),
          });

          const rowsForCleanup: Array<Partial<CamelRow>> = [
            ...result.rows,
            ...inputs,
          ];

          const seenDepotKeys = new Set<string>();

          for (const row of rowsForCleanup) {
            const pk = primaryKeyParts.map(key => (row as any)[key]);
            const hasCompletePk = pk.every(
              value => value !== undefined && value !== null,
            );

            if (!hasCompletePk) {
              continue;
            }

            const depotKey = ["dpt", "public", ...queryBaseKey(), ...pk];
            const depotKeyHash = JSON.stringify(depotKey);

            if (seenDepotKeys.has(depotKeyHash)) {
              continue;
            }

            seenDepotKeys.add(depotKeyHash);
            queryClientRef.removeQueries({
              queryKey: depotKey,
              exact: true,
            });
          }

          queryClientRef.invalidateQueries({
            queryKey: ["net", "public", ...queryBaseKey()],
          });
        },
      });

      return createDeleterInstance<Defaults>();
    };
  }
}
