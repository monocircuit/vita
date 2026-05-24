"use client";

import type { KeysToCamelCase } from "@/vendor/utilities/functions";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import type { NormalizedRowFor } from "../writer";
import { TanstackDeleterBuilder } from "./TanstackDeleterBuilder";
import type {
  DeleterConnector,
  DeleterConnectorContext,
  DeleterTableConfig,
} from "./types";

export function createTanstackDeleter<
  DB extends DbShape,
  Schemas extends SchemasShape,
>() {
  function table<
    Table extends DbTableName<DB>,
    PrimaryKey extends keyof NormalizedRowFor<DB, Schemas, Table> & string,
  >(
    tableName: Table,
    config: Omit<
      DeleterTableConfig<DB, Schemas, Table, PrimaryKey>,
      "tableName"
    >,
  ): DeleterTableConfig<DB, Schemas, Table, PrimaryKey> {
    return {
      tableName,
      primaryKeyParts: config.primaryKeyParts,
      baseKey: config.baseKey,
    };
  }

  function on<
    Table extends DbTableName<DB>,
    PrimaryKey extends keyof NormalizedRowFor<DB, Schemas, Table> & string,
  >(
    tableConfig: DeleterTableConfig<DB, Schemas, Table, PrimaryKey>,
  ) {
    const builder = new TanstackDeleterBuilder<
      DB,
      Schemas,
      Table,
      PrimaryKey
    >(
      tableConfig.tableName,
    );

    builder.primaryKeyParts(...tableConfig.primaryKeyParts);

    if (tableConfig.baseKey) {
      builder.baseKey(tableConfig.baseKey);
    }

    return {
      connect(
        connector: (
          context: Omit<DeleterConnectorContext<Table>, "rows" | "primaryKeyParts"> & {
            rows: Pick<NormalizedRowFor<DB, Schemas, Table>, PrimaryKey>[];
            primaryKeyParts: PrimaryKey[];
          },
        ) => Promise<Record<string, unknown>[] | null>,
      ) {
        return builder.connector(connector as DeleterConnector<Table>).build();
      },
      build() {
        return builder.build();
      },
      builder,
    };
  }

  return {
    table,
    on,

    create<Table extends DbTableName<DB>>(
      tableName: Table,
    ): TanstackDeleterBuilder<DB, Schemas, Table> {
      return new TanstackDeleterBuilder<DB, Schemas, Table>(tableName);
    },

    withDefaults<Table extends DbTableName<DB>>() {
      return <D extends Partial<KeysToCamelCase<NormalizedRowFor<DB, Schemas, Table>>>>(
        tableName: Table,
        defaults: D,
      ) => {
        return new TanstackDeleterBuilder<DB, Schemas, Table>(
          tableName,
        ).withDefaults(defaults);
      };
    },
  };
}
