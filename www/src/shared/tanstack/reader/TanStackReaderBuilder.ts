import type { QueryKey } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

import type {
  ArgList,
  DataReader,
  DataReaderConfig,
  NormalizedRowFor,
  SchemaKeyFor,
} from "./types";
import { createDataReader } from "./createDataReader";

import { createClient } from "../../supabase/client";
import { toPascalCase } from "@/utils/case-conversions";

/**
 * Internal builder class for creating Supabase data readers with a fluent API.
 */
export class TanstackReaderBuilder<
  Table extends keyof Database["public"]["Tables"],
  Args = undefined,
> {
  private _fetcher?: DataReaderConfig<NormalizedRowFor<Table>, Args>["fetch"];

  private _primaryKeyParts?: (keyof NormalizedRowFor<Table> & string)[];
  private _queryBaseKey?: () => QueryKey;
  private _queryNetworkKey?: (...selector: ArgList<Args>) => QueryKey;

  constructor(private readonly tableName: Table) {}

  fetcher(
    fn: (
      client: Awaited<ReturnType<typeof createClient>>,
      user: User,
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

  primaryKeyParts(...keys: (keyof NormalizedRowFor<Table> & string)[]): this {
    this._primaryKeyParts = keys;
    return this;
  }

  private buildConfig<Single extends boolean | undefined>(
    single: Single,
  ): DataReaderConfig<NormalizedRowFor<Table>, Args, Single> {
    if (!this._fetcher) {
      throw new Error("SupabaseReader: fetcher(...) wurde nicht gesetzt");
    }
    if (!this._queryNetworkKey) {
      throw new Error("SupabaseReader: networkKey(...) wurde nicht gesetzt");
    }

    const schemaKey =
      `${toPascalCase(this.tableName as string)}` as SchemaKeyFor<Table>;

    const normalizer = async () => {
      const mod = await import("@/shared/supabase/schemas");
      const runtimeSchemas = (mod as any).$Schemas as Record<string, any>;
      const schemaEntry = runtimeSchemas[schemaKey as string];
      if (!schemaEntry) {
        throw new Error(
          `SupabaseReader: Kein Schema für Tabelle "${String(this.tableName)}" unter Key "${String(schemaKey)}" in $Schemas gefunden`,
        );
      }
      return schemaEntry.Normalize as any;
    };

    const primaryKeyParts =
      this._primaryKeyParts ?? (["id"] as (keyof NormalizedRowFor<Table>)[]);
    const queryBaseKey = this._queryBaseKey ?? (() => [this.tableName]);

    const cfg: DataReaderConfig<NormalizedRowFor<Table>, Args, Single> = {
      fetch: this._fetcher as any,
      normalizer: normalizer as any,
      isSingleRow: single,
      primaryKeyParts: primaryKeyParts as any,
      queryBaseKey,
      queryNetworkKey: this._queryNetworkKey!,
    };

    return cfg;
  }

  build(): DataReader<NormalizedRowFor<Table>, Args, false | undefined> {
    const cfg = this.buildConfig(false);
    return createDataReader(cfg);
  }

  isSingleRow(): DataReader<NormalizedRowFor<Table>, Args, true> {
    const cfg = this.buildConfig(true);
    return createDataReader(cfg);
  }
}
