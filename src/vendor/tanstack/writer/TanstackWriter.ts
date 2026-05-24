"use client";

import type { KeysToCamelCase } from "@/vendor/utilities/functions";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import type { InsertRowFor } from "./types";
import { TanstackWriterBuilder } from "./TanstackWriterBuilder";
import type { NormalizedRowFor, WriterConnector } from "./types";

export interface WriterTableConfig<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
> {
  tableName: Table;
  primaryKeyParts?: (keyof NormalizedRowFor<DB, Schemas, Table> & string)[];
  baseKey?: () => string[];
}

export function createTanstackWriter<
  DB extends DbShape,
  Schemas extends SchemasShape,
>() {
  function table<Table extends DbTableName<DB>>(
    tableName: Table,
    config?: Omit<WriterTableConfig<DB, Schemas, Table>, "tableName">,
  ): WriterTableConfig<DB, Schemas, Table> {
    return {
      tableName,
      primaryKeyParts: config?.primaryKeyParts,
      baseKey: config?.baseKey,
    };
  }

  function on<Table extends DbTableName<DB>>(
    tableConfig: WriterTableConfig<DB, Schemas, Table>,
  ) {
    const builder = new TanstackWriterBuilder<DB, Schemas, Table>(
      tableConfig.tableName,
    );

    if (tableConfig.primaryKeyParts?.length) {
      builder.primaryKeyParts(...tableConfig.primaryKeyParts);
    }

    if (tableConfig.baseKey) {
      builder.baseKey(tableConfig.baseKey);
    }

    return {
      connect(connector: WriterConnector<Table>) {
        return builder.connector(connector).build();
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
    ): TanstackWriterBuilder<DB, Schemas, Table> {
      return new TanstackWriterBuilder<DB, Schemas, Table>(tableName);
    },

    withDefaults<Table extends DbTableName<DB>>() {
      return <D extends Partial<KeysToCamelCase<InsertRowFor<DB, Table>>>>(
        tableName: Table,
        defaults: D,
      ) => {
        return new TanstackWriterBuilder<DB, Schemas, Table>(
          tableName,
        ).withDefaults(defaults);
      };
    },
  };
}
