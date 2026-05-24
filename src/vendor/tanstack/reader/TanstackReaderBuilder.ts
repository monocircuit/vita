import type { QueryKey } from "@tanstack/react-query";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import type {
  ArgList,
  DataReader,
  DataReaderConfig,
  NormalizedRowFor,
  SchemaKeyFor,
} from "./types";
import { createDataReader } from "./createDataReader";
import { getTanstackSchemas, type TanstackAuthUser } from "../config";
import { toPascalCase } from "@/vendor/utilities/functions";

export class TanstackReaderBuilder<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
  Args = undefined,
> {
  private _fetcher?: DataReaderConfig<
    NormalizedRowFor<DB, Schemas, Table>,
    Args
  >["fetch"];
  private _primaryKeyParts?: (keyof NormalizedRowFor<DB, Schemas, Table> &
    string)[];
  private _queryBaseKey?: () => QueryKey;
  private _queryNetworkKey?: (...selector: ArgList<Args>) => QueryKey;

  constructor(private readonly tableName: Table) {}

  fetcher(
    fn: (
      client: any,
      user: TanstackAuthUser,
      ...selector: ArgList<Args>
    ) => Promise<Record<string, unknown>[] | null>,
  ): this {
    this._fetcher = fn as any;
    return this;
  }

  baseKey(fn: () => QueryKey): this {
    this._queryBaseKey = fn;
    return this;
  }

  networkKey(fn: (...selector: ArgList<Args>) => QueryKey): this {
    this._queryNetworkKey = fn;
    return this;
  }

  primaryKeyParts(
    ...keys: (keyof NormalizedRowFor<DB, Schemas, Table> & string)[]
  ): this {
    this._primaryKeyParts = keys;
    return this;
  }

  private buildConfig<Single extends boolean | undefined>(
    single: Single,
  ): DataReaderConfig<NormalizedRowFor<DB, Schemas, Table>, Args, Single> {
    if (!this._fetcher) {
      throw new Error("TanstackReader: fetcher(...) wurde nicht gesetzt");
    }
    if (!this._queryNetworkKey) {
      throw new Error("TanstackReader: networkKey(...) wurde nicht gesetzt");
    }

    const schemaKey =
      `${toPascalCase(this.tableName as string)}` as SchemaKeyFor<
        Table,
        Schemas
      >;

    const normalizer = async () => {
      const runtimeSchemas = await getTanstackSchemas();
      const schemaEntry = runtimeSchemas[schemaKey as string];
      if (!schemaEntry?.Normalize) {
        throw new Error(
          `TanstackReader: Kein Schema für Tabelle \"${String(this.tableName)}\" unter Key \"${String(schemaKey)}\" in configured schemas gefunden`,
        );
      }
      return schemaEntry.Normalize as any;
    };

    const primaryKeyParts =
      this._primaryKeyParts ??
      (["id"] as (keyof NormalizedRowFor<DB, Schemas, Table>)[]);
    const queryBaseKey = this._queryBaseKey ?? (() => [this.tableName]);

    return {
      fetch: this._fetcher as any,
      normalizer: normalizer as any,
      isSingleRow: single,
      primaryKeyParts: primaryKeyParts as any,
      queryBaseKey,
      queryNetworkKey: this._queryNetworkKey!,
    };
  }

  build(): DataReader<
    NormalizedRowFor<DB, Schemas, Table>,
    Args,
    false | undefined
  > {
    return createDataReader(this.buildConfig(false));
  }

  isSingleRow(): DataReader<NormalizedRowFor<DB, Schemas, Table>, Args, true> {
    return createDataReader(this.buildConfig(true));
  }
}
