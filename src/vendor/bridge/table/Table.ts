import type { KeysToCamelCase } from "@/vendor/utilities/functions";
import { createZodSchemaFromTable } from "./createZodSchemaFromTableInternal";
import { ColumnBuilderPre } from "./ColumnBuilderPre";

import type {
  RuntimeTransformMap,
  NormMapBase,
  Normalized,
  PatchMutationConfig,
  MutationMap,
  MutationConfigInput,
  NormalizedMutationMap,
  UnwrapArray,
  DbShape,
  DbTableName,
  DbRow,
} from "./types";

/**
 * Helper type for mutation config input with proper `from` typing.
 * `from` receives the element type if `to` returns an array.
 * `from` is optional for data-loss mutations that cannot be reversed.
 */
interface MultiMutationInput<Norm, ToReturn> {
  to: (norm: Norm) => ToReturn;
  from?: (out: UnwrapArray<ToReturn>) => Norm;
}

/**
 * Main fluent table builder.
 *
 * Responsibilities:
 * - collect per-column normalize/denormalize transformations
 * - register mutation projections
 * - build zod-backed Raw/Normalize/Denormalize/Mutations schemas
 */
export class Table<
  DB extends DbShape,
  TableName extends DbTableName<DB>,
  Raw extends object = DbRow<DB, TableName>,
  NormMap extends NormMapBase<Raw> = {},
  MutMap extends MutationMap<Normalized<Raw, NormMap>> = MutationMap<
    Normalized<Raw, NormMap>
  >,
> {
  constructor(
    public readonly tableName: TableName,
    public readonly transforms: RuntimeTransformMap<Raw> = {} as any,
    public readonly mutationConfigs: MutMap = {} as any,
  ) {}

  /**
   * Starts a table definition for a database table key.
   */
  static create<DB extends DbShape, TableName extends DbTableName<DB>>(
    tableName: TableName,
  ) {
    type Raw = DbRow<DB, TableName>;
    return new Table<DB, TableName, Raw, {}>(tableName);
  }

  // overload: when caller passes a known key (literal), preserve that literal type
  column<K extends keyof KeysToCamelCase<Raw>>(
    key: K,
  ): ColumnBuilderPre<DB, TableName, Raw, NormMap, MutMap, K>;
  // fallback overload: accept arbitrary string (less specific)
  column(
    key: string,
  ): ColumnBuilderPre<DB, TableName, Raw, NormMap, MutMap, keyof KeysToCamelCase<Raw>>;

  // implementation (use a permissive runtime signature and cast internally)
  column(key: string) {
    const makeTableBuilder = (
      tableName: TableName,
      transforms: any,
      mutationConfigs: any,
    ) =>
      new Table<DB, TableName, Raw, NormMap, MutMap>(
        tableName,
        transforms,
        mutationConfigs,
      );

    return new ColumnBuilderPre<DB, TableName, Raw, NormMap, MutMap, any>(
      this as any,
      key as any,
      makeTableBuilder,
    );
  }
  // Overloads to improve contextual typing of function literals in `to`/`from`.
  // Multi-style mutations: `from` receives element type if `to` returns array
  mutations<
    NewMutMapInput extends Record<
      string,
      | MultiMutationInput<Normalized<Raw, NormMap>, any>
      | {
          removedKeys: readonly (keyof Normalized<Raw, NormMap> & string)[];
        }
    >,
  >(
    configs: NewMutMapInput,
  ): Table<
    DB,
    TableName,
    Raw,
    NormMap,
    MutMap & NormalizedMutationMap<Normalized<Raw, NormMap>, NewMutMapInput>
  >;

  // implementation signature (general)
  mutations<
    const NewMutMapInput extends Record<
      string,
      MutationConfigInput<Normalized<Raw, NormMap>>
    >,
  >(
    configs: NewMutMapInput,
  ): Table<
    DB,
    TableName,
    Raw,
    NormMap,
    MutMap & NormalizedMutationMap<Normalized<Raw, NormMap>, NewMutMapInput>
  > {
    type Norm = Normalized<Raw, NormMap>;

    // Normalize shorthand input into runtime-stable mutation configs.
    const normalized: MutationMap<Norm> = {} as any;

    for (const key of Object.keys(configs) as (keyof NewMutMapInput &
      string)[]) {
      const conf = configs[key] as MutationConfigInput<Norm>;

      // Runtime inference: if a `to` accepting `Norm` is present, treat as multi.
      // We check for a `to` function; callers may omit explicit `kind`.
      // `from` is optional for data-loss mutations.
      if (typeof (conf as any).to === "function") {
        // multi-style: ensure kind is set for runtime checks
        normalized[key] = {
          kind: "multi",
          to: (conf as any).to,
          from: (conf as any).from, // may be undefined for data-loss mutations
        } as any;
      } else {
        // patch-style: ensure we have a full PatchMutationConfig
        const full: PatchMutationConfig<Norm, any, any> =
          (conf as any).to && (conf as any).from
            ? (conf as any)
            : {
                kind: "patch",
                removedKeys: (conf as any).removedKeys as any,
                to: (_norm: any) => ({}),
                from: (_view: any) => ({}),
              };
        normalized[key] = full;
      }
    }

    const nextMutations = {
      ...(this.mutationConfigs as any),
      ...normalized,
    } as MutMap &
      NormalizedMutationMap<Normalized<Raw, NormMap>, NewMutMapInput>;

    return new Table<DB, TableName, Raw, NormMap, typeof nextMutations>(
      this.tableName,
      this.transforms,
      nextMutations,
    );
  }

  /**
   * Builds this table into a schema object ready to be merged by a registry.
   */
  async build() {
    return createZodSchemaFromTable<DB, TableName, Raw, NormMap, MutMap>(
      this.tableName,
      this.transforms,
      this.mutationConfigs,
    );
  }
}

/** Alias export for compatibility with existing call sites. */
export const BridgeTable = Table;
