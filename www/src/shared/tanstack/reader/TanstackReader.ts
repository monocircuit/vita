import { TanstackReaderBuilder } from "./TanStackReaderBuilder";
import type { Camelize, Snakeize } from "@/utils/case-conversions";
import { toSnakeCase } from "@/utils/case-conversions";

/** All valid camelCase table names */
type CamelizedTableName = Camelize<keyof Database["public"]["Tables"]>;

/** Map camelCase table name back to snake_case Database key */
type ToSnakeTable<T extends string> =
  Snakeize<T> extends keyof Database["public"]["Tables"] ? Snakeize<T> : never;

export class TanstackReader {
  /**
   * Create a new TanstackReader for a table.
   * Accepts camelCase table names (e.g., "vitasShardsDynamic").
   *
   * @example
   * // Without additional args
   * TanstackReader.create("profiles").fetcher(...)
   *
   * // With args - use withArgs() helper
   * TanstackReader.withArgs<[vitaId: string]>().create("vitasShardsDynamic").fetcher(...)
   */
  static create<CamelTable extends CamelizedTableName>(
    tableName: CamelTable,
  ): TanstackReaderBuilder<ToSnakeTable<CamelTable>, undefined> {
    const snakeTableName = toSnakeCase(tableName) as ToSnakeTable<CamelTable>;
    return new TanstackReaderBuilder<ToSnakeTable<CamelTable>, undefined>(
      snakeTableName,
    );
  }

  /**
   * Create a reader with custom argument types.
   * @example TanstackReader.withArgs<[vitaId: string]>().create("vitasShardsDynamic")
   */
  static withArgs<Args>() {
    return {
      create<CamelTable extends CamelizedTableName>(
        tableName: CamelTable,
      ): TanstackReaderBuilder<ToSnakeTable<CamelTable>, Args> {
        const snakeTableName = toSnakeCase(
          tableName,
        ) as ToSnakeTable<CamelTable>;
        return new TanstackReaderBuilder<ToSnakeTable<CamelTable>, Args>(
          snakeTableName,
        );
      },
    };
  }
}

export default TanstackReader;
