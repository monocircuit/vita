import type { Table } from "./Table";
import type { Camelize } from "@/utils/case-conversions";
import type { NormMapBase, MutationMap } from "./types";
import { ColumnBuilderPost } from "./ColumnBuilderPost";

/**
 * Lightweight pre-normalize column builder.
 * Created by `TableBuilder.column()` and used to register a normalize fn.
 */
export class ColumnBuilderPre<
  TableName extends keyof Database["public"]["Tables"],
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
  MutMap extends MutationMap<any>,
  Name extends keyof Camelize<Raw>,
> {
  constructor(
    public readonly parent: Table<TableName, Raw, NormMap, MutMap>,
    public readonly key: Name,
    // factory to create a Table instance to avoid runtime cycles
    public readonly makeTableBuilder: (
      tableName: TableName,
      transforms: any,
      mutationConfigs: any,
    ) => Table<TableName, Raw, NormMap, MutMap>,
  ) {}

  normalize<N>(
    fn: (raw: Camelize<Raw>[Name & keyof Camelize<Raw>]) => N,
  ): ColumnBuilderPost<
    TableName,
    Raw,
    NormMap & { [P in Name & keyof Camelize<Raw>]: N },
    MutMap,
    Name,
    N
  > {
    (this.parent.transforms as any)[this.key as any] = [
      fn,
      undefined as any,
    ] as any;

    return new ColumnBuilderPost<
      TableName,
      Raw,
      NormMap & { [P in Name & keyof Camelize<Raw>]: N },
      MutMap,
      Name,
      N
    >(this.parent as any, this.key as any, this.makeTableBuilder);
  }
}

export default ColumnBuilderPre;
