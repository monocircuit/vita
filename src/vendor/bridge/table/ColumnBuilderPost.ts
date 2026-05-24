import type { Table } from "./Table";
import type { KeysToCamelCase, Snakeize } from "@/vendor/utilities/functions";
import type {
  DbShape,
  DbTableName,
  DbRow,
  NormMapBase,
  MutationMap,
  ColumnTransformationPair,
} from "./types";

/**
 * Post-normalize builder: attach a denormalize function and return a new builder.
 * Uses a factory passed from the TableBuilder creator to produce the next builder
 * instance without importing `TableBuilder` at runtime (avoids cycles).
 */
export class ColumnBuilderPost<
  DB extends DbShape,
  TableName extends DbTableName<DB>,
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
  MutMap extends MutationMap<any>,
  Name extends keyof KeysToCamelCase<Raw>,
  NormK,
> {
  constructor(
    public readonly parent: Table<DB, TableName, Raw, any, MutMap>,
    public readonly key: Name,
    public readonly makeTableBuilder: (
      tableName: TableName,
      transforms: any,
      mutationConfigs: any,
    ) => Table<DB, TableName, Raw, NormMap, MutMap>,
  ) {}

  /**
   * Attach a denormalize function.
   * We accept any return type here and cast internally to keep the API ergonomic
   * — callers will typically return the original `Raw` value (e.g. `string[]`).
   */
  denormalize(
    fn: (
      norm: NormK,
    ) => DbRow<DB, TableName>[Snakeize<Name> & keyof DbRow<DB, TableName>],
  ): Table<DB, TableName, Raw, NormMap, MutMap> {
    const pair = this.parent.transforms[this.key] as
      | ColumnTransformationPair<any, any>
      | undefined;

    if (pair) {
      pair[1] = fn as any;
    } else {
      this.parent.transforms[this.key] = [undefined as any, fn as any];
    }

    // use factory to create a new TableBuilder instance (immutable builder)
    return this.makeTableBuilder(
      this.parent.tableName,
      this.parent.transforms,
      this.parent.mutationConfigs,
    );
  }
}

export default ColumnBuilderPost;
