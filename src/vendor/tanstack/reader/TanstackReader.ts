import { toSnakeCase } from "@/vendor/utilities/functions";
import type { Camelize, Snakeize } from "@/vendor/utilities/functions";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import { TanstackReaderBuilder } from "./TanstackReaderBuilder";
import { createTanstackEnumReader } from "./TanstackEnumReader";

type CamelizedTableName<DB extends DbShape> = Extract<
  Camelize<DbTableName<DB>>,
  string
>;

type ToSnakeTable<DB extends DbShape, T extends string> = Extract<
  Snakeize<T>,
  DbTableName<DB>
>;

export interface ReaderTableConfig<CamelTable extends string> {
  tableName: CamelTable;
  primaryKeyParts?: string[];
  baseKey?: () => string[];
}

function makeReaderBuilder<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Args,
  CamelTable extends CamelizedTableName<DB>,
>(
  tableName: CamelTable,
): TanstackReaderBuilder<DB, Schemas, ToSnakeTable<DB, CamelTable>, Args> {
  const snakeTableName = toSnakeCase(tableName) as ToSnakeTable<DB, CamelTable>;

  return new TanstackReaderBuilder<
    DB,
    Schemas,
    ToSnakeTable<DB, CamelTable>,
    Args
  >(snakeTableName);
}

export function createTanstackReader<
  DB extends DbShape,
  Schemas extends SchemasShape,
>() {
  class TanstackTableReader {
    static create<CamelTable extends CamelizedTableName<DB>>(
      tableName: CamelTable,
    ): TanstackReaderBuilder<
      DB,
      Schemas,
      ToSnakeTable<DB, CamelTable>,
      undefined
    > {
      return makeReaderBuilder<DB, Schemas, undefined, CamelTable>(tableName);
    }

    static table<CamelTable extends CamelizedTableName<DB>>(
      tableName: CamelTable,
      config?: Omit<ReaderTableConfig<CamelTable>, "tableName">,
    ): ReaderTableConfig<CamelTable> {
      return {
        tableName,
        primaryKeyParts: config?.primaryKeyParts,
        baseKey: config?.baseKey,
      };
    }

    static on<CamelTable extends CamelizedTableName<DB>>(
      tableConfig: ReaderTableConfig<CamelTable>,
    ) {
      const builder = makeReaderBuilder<DB, Schemas, undefined, CamelTable>(
        tableConfig.tableName,
      );

      if (tableConfig.primaryKeyParts?.length) {
        builder.primaryKeyParts(...(tableConfig.primaryKeyParts as any));
      }

      if (tableConfig.baseKey) {
        builder.baseKey(tableConfig.baseKey);
      }

      return {
        connect(fetcher: Parameters<typeof builder.fetcher>[0]) {
          return builder.fetcher(fetcher);
        },
        build() {
          return builder.build();
        },
        isSingleRow() {
          return builder.isSingleRow();
        },
        builder,
      };
    }

    static withArgs<Args>() {
      return {
        create<CamelTable extends CamelizedTableName<DB>>(
          tableName: CamelTable,
        ): TanstackReaderBuilder<
          DB,
          Schemas,
          ToSnakeTable<DB, CamelTable>,
          Args
        > {
          return makeReaderBuilder<DB, Schemas, Args, CamelTable>(tableName);
        },

        table<CamelTable extends CamelizedTableName<DB>>(
          tableName: CamelTable,
          config?: Omit<ReaderTableConfig<CamelTable>, "tableName">,
        ): ReaderTableConfig<CamelTable> {
          return {
            tableName,
            primaryKeyParts: config?.primaryKeyParts,
            baseKey: config?.baseKey,
          };
        },

        on<CamelTable extends CamelizedTableName<DB>>(
          tableConfig: ReaderTableConfig<CamelTable>,
        ) {
          const builder = makeReaderBuilder<DB, Schemas, Args, CamelTable>(
            tableConfig.tableName,
          );

          if (tableConfig.primaryKeyParts?.length) {
            builder.primaryKeyParts(...(tableConfig.primaryKeyParts as any));
          }

          if (tableConfig.baseKey) {
            builder.baseKey(tableConfig.baseKey);
          }

          return {
            connect(fetcher: Parameters<typeof builder.fetcher>[0]) {
              return builder.fetcher(fetcher);
            },
            build() {
              return builder.build();
            },
            isSingleRow() {
              return builder.isSingleRow();
            },
            builder,
          };
        },
      };
    }
  }

  class TanstackReader {
    static Table = TanstackTableReader;
    static Enum = createTanstackEnumReader<DB>();
  }

  return TanstackReader;
}
