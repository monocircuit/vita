import type { Table } from "./Table";
import type { KeysToCamelCase } from "@/vendor/utilities/functions";
import type { DbShape, DbTableName, NormMapBase, MutationMap } from "./types";
import { ColumnBuilderPost } from "./ColumnBuilderPost";

/**
 * Lightweight pre-normalize column builder.
 * Created by `TableBuilder.column()` and used to register a normalize fn.
 */
export class ColumnBuilderPre<
  DB extends DbShape,
  TableName extends DbTableName<DB>,
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
  MutMap extends MutationMap<any>,
  Name extends keyof KeysToCamelCase<Raw>,
> {
  constructor(
    public readonly parent: Table<DB, TableName, Raw, NormMap, MutMap>,
    public readonly key: Name,
    // factory to create a Table instance to avoid runtime cycles
    public readonly makeTableBuilder: (
      tableName: TableName,
      transforms: any,
      mutationConfigs: any,
    ) => Table<DB, TableName, Raw, NormMap, MutMap>,
  ) {}

  normalize<N>(
    fn: (raw: KeysToCamelCase<Raw>[Name & keyof KeysToCamelCase<Raw>]) => N,
  ): ColumnBuilderPost<
    DB,
    TableName,
    Raw,
    NormMap & { [P in Name & keyof KeysToCamelCase<Raw>]: N },
    MutMap,
    Name,
    N
  > {
    (this.parent.transforms as any)[this.key as any] = [
      fn,
      undefined as any,
    ] as any;

    return new ColumnBuilderPost<
      DB,
      TableName,
      Raw,
      NormMap & { [P in Name & keyof KeysToCamelCase<Raw>]: N },
      MutMap,
      Name,
      N
    >(this.parent as any, this.key as any, this.makeTableBuilder);
  }
}

export default ColumnBuilderPre;
