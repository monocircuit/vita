/** Core type utilities used by the table/registry bridge builders. */
import type { KeysToCamelCase } from "@/vendor/utilities/functions";
import type { Table } from "./Table";

/**
 * Minimal database contract expected by bridge generics.
 *
 * Consumers typically pass their generated Supabase `Database` type.
 */
export type DbShape = {
  public: {
    Tables: Record<string, { Row: object }>;
  };
};

/** String table key names available on a database type. */
export type DbTableName<DB extends DbShape> =
  keyof DB["public"]["Tables"] & string;

/** Row type for a concrete table key. */
export type DbRow<DB extends DbShape, T extends DbTableName<DB>> =
  DB["public"]["Tables"][T]["Row"] & object;

export type Overwrite<T, R> = Omit<T, keyof R> & R;

export type NormMapBase<Raw extends object> = Partial<
  Record<keyof KeysToCamelCase<Raw>, any>
>;

export type NormalizedFromNormMap<
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
> = {
  [K in keyof KeysToCamelCase<Raw>]: K extends keyof NormMap
    ? NormMap[K]
    : KeysToCamelCase<Raw>[K];
};

export type Normalized<
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
> = NormalizedFromNormMap<Raw, NormMap>;

/**
 * Pair of runtime transformation functions for a single column.
 * [normalize, denormalize]
 */
export type ColumnTransformationPair<C, N> = [(raw: C) => N, (norm: N) => C];

/**
 * Runtime map for column-level transformation functions.
 */
export type RuntimeTransformMap<Raw extends object> = {
  [K in keyof KeysToCamelCase<Raw>]?: ColumnTransformationPair<KeysToCamelCase<Raw>[K], any>;
};

export type PascalizeKey<K extends string> = K extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : K;

/**
 * Any table builder reference — typed-only alias to avoid circular runtime deps.
 */
export type AnyTableBuilder = Table<any, any, any, any, any>;

export type ViewType<
  Norm,
  RemovedKeys extends keyof Norm,
  Patch extends Partial<Omit<Norm, RemovedKeys>>,
> = Overwrite<Omit<Norm, RemovedKeys>, Patch>;

/**
 * Unwrap array types to get the element type.
 * If T is an array, returns the element type; otherwise returns T as-is.
 */
export type UnwrapArray<T> = T extends readonly (infer U)[] ? U : T;

/* Mutation model */

export interface PatchMutationConfig<
  Norm,
  RemovedKeys extends keyof Norm,
  Patch extends Partial<Omit<Norm, RemovedKeys>>,
> {
  kind: "patch";
  removedKeys: readonly RemovedKeys[];
  to: (norm: Omit<Norm, RemovedKeys>) => Patch;
  from: (
    view: ViewType<Norm, RemovedKeys, Patch>,
  ) => Partial<Omit<Norm, RemovedKeys>>;
}

/**
 * Multi mutation config.
 * - `Out` is the full return type of `to` (may be an array or single value)
 * - `from` receives the element type if `Out` is an array, otherwise `Out` directly
 * - `from` is optional for data-loss mutations that cannot be reversed
 */
export interface MultiMutationConfig<
  Norm,
  Out,
  HasFrom extends boolean = boolean,
> {
  kind: "multi";
  to: (norm: Norm) => Out;
  from: HasFrom extends true ? (out: UnwrapArray<Out>) => Norm : undefined;
}

/** Utility type that checks whether a mutation has a reversible `from` function. */
export type HasFromFunction<Conf> = Conf extends {
  from: (...args: any[]) => any;
}
  ? true
  : false;

export type AnyMutationConfig<Norm> =
  | PatchMutationConfig<Norm, any, any>
  | MultiMutationConfig<Norm, any, true>
  | MultiMutationConfig<Norm, any, false>;

export type MutationMap<Norm> = Record<string, AnyMutationConfig<Norm>>;

/**
 * Input shape accepted by `Table.mutations`.
 *
 * Callers may omit the explicit `kind` — the runtime will infer it:
 * - If a `to` function accepting the full `Norm` is present, it's a `multi`.
 * - Otherwise it's treated as a `patch` and must provide `removedKeys` (and
 *   optional `to`/`from` helpers).
 */
export type MutationConfigInput<Norm> =
  | {
      // patch-style: `removedKeys` are required for patch inputs.
      // NOTE: `to`/`from` helpers for patch are NOT part of the ergonomic
      // input form to keep contextual typing working for `multi`.
      kind?: "patch";
      removedKeys: readonly (keyof Norm & string)[];
    }
  | {
      // multi-style: presence of `to` with full Norm indicates multi
      // `from` is optional for data-loss mutations that cannot be reversed
      kind?: "multi";
      to: (norm: Norm) => any;
      from?: (out: any) => Norm;
    };

export type ViewFromConfig<Norm, Conf> =
  Conf extends PatchMutationConfig<Norm, infer RemovedKeys, infer Patch>
    ? ViewType<Norm, RemovedKeys, Patch>
    : Conf extends MultiMutationConfig<Norm, infer Out>
      ? Out
      : never;

export type NormalizedMutationMap<Norm, M extends Record<string, any>> = {
  [K in keyof M]: NormalizeConfig<Norm, M[K]>;
};

/**
 * Internal normalize config helper exported for reuse.
 * Captures the return type of `to` directly for multi mutations.
 * Also tracks whether `from` is defined for type-safe mutation schemas.
 */
export type NormalizeConfig<Norm, Conf> =
  // If `Conf` provides both `to` and `from` functions, it's a reversible multi mutation
  Conf extends {
    to: (norm: Norm) => infer Out;
    from: (out: any) => Norm;
  }
    ? MultiMutationConfig<Norm, Out, true>
    : // If `Conf` provides only `to`, it's a data-loss multi mutation (no `from`)
      Conf extends {
          to: (norm: Norm) => infer Out;
        }
      ? MultiMutationConfig<Norm, Out, false>
      : // Otherwise, if it has `removedKeys` it's a patch
        Conf extends {
            removedKeys: readonly (infer RK)[];
          }
        ? PatchMutationConfig<Norm, Extract<RK, keyof Norm>, {}>
        : never;

/* Inference helpers for built schema maps */

export interface InferZodTableSchema<
  S extends {
    Raw: import("zod").ZodType<any, any>;
    Normalize: import("zod").ZodType<any, any>;
    Denormalize: import("zod").ZodType<any, any>;
    Mutations?: Record<
      string,
      {
        To: import("zod").ZodType<any, any>;
        From?: import("zod").ZodType<any, any>;
      }
    >;
  },
> {
  Raw: import("zod").output<S["Raw"]>;
  Normalized: import("zod").output<S["Normalize"]>;
  Denormalized: import("zod").output<S["Denormalize"]>;
  /**
   * Mutations are available under `Mutations.MutationName`.
   * Each mutation exposes the element type (unwrapped from arrays if `to` returns an array).
   */
  Mutations: S["Mutations"] extends Record<string, any>
    ? {
        [K in keyof S["Mutations"]]: UnwrapArray<
          import("zod").output<S["Mutations"][K]["To"]>
        >;
      }
    : {};
}

export type InferZodMap<
  M extends Record<
    string,
    {
      Raw: import("zod").ZodType<any, any>;
      Normalize: import("zod").ZodType<any, any>;
      Denormalize: import("zod").ZodType<any, any>;
      Mutations?: Record<
        string,
        {
          To: import("zod").ZodType<any, any>;
          From?: import("zod").ZodType<any, any>;
        }
      >;
    }
  >,
> = {
  [K in keyof M]: InferZodTableSchema<M[K]>;
};
