import { z } from "zod";
import type { ZodType, ZodTypeAny } from "zod";
import { sqlToZod, sqlToZodMap } from "@/utils/sqlToZod";
import fetchColumnMetaData from "@/shared/bridge/table/fetchColumnMetaData";
import {
  Camelize,
  keysToCamelCase,
  Pascalize,
  toCamelCase,
  toPascalCase,
} from "@/utils/case-conversions";
import type {
  RuntimeTransformMap,
  MutationMap,
  NormalizedFromNormMap,
  NormMapBase,
  Normalized,
  PascalizeKey,
  AnyMutationConfig,
  MultiMutationConfig,
  PatchMutationConfig,
  UnwrapArray,
  ViewFromConfig,
} from "./types";

/**
 * Helper type to build the mutation schema shape.
 * - If the mutation has `from` (reversible), include both `To` and `From`
 * - If the mutation has no `from` (data-loss), only include `To`
 */
type MutationSchemaFor<Norm, Conf> =
  Conf extends MultiMutationConfig<Norm, any, infer HasFrom>
    ? HasFrom extends true
      ? {
          To: ZodType<ViewFromConfig<Norm, Conf>, MutationToInput<Norm, Conf>>;
          From: ZodType<Norm, UnwrapArray<ViewFromConfig<Norm, Conf>>>;
        }
      : {
          To: ZodType<ViewFromConfig<Norm, Conf>, MutationToInput<Norm, Conf>>;
        }
    : {
        To: ZodType<ViewFromConfig<Norm, Conf>, MutationToInput<Norm, Conf>>;
        From: ZodType<Partial<Norm>, ViewFromConfig<Norm, Conf>>;
      };

type MutationToInput<Norm, Conf> =
  Conf extends PatchMutationConfig<Norm, infer RemovedKeys, any>
    ? Omit<Norm, RemovedKeys>
    : Norm;

/**
 * Internal helper: create zod schemas for a table (extracted from Table.ts)
 * Kept as a standalone module to keep `Table.ts` smaller and easier to test.
 */
export async function createZodSchemaFromTable<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object = Database["public"]["Tables"][Table]["Row"],
  NormMap extends NormMapBase<Raw> = {},
  MutMap extends MutationMap<Normalized<Raw, NormMap>> = MutationMap<
    Normalized<Raw, NormMap>
  >,
>(
  tableName: Table,
  transforms: RuntimeTransformMap<Raw>,
  mutations: MutMap,
): Promise<{
  [K in Pascalize<Table>]: {
    Raw: ZodType<Raw, any>;
    Normalize: ZodType<NormalizedFromNormMap<Raw, NormMap>, Raw>;
    Denormalize: ZodType<Raw, NormalizedFromNormMap<Raw, NormMap>>;
    Mutations: {
      [M in keyof MutMap as PascalizeKey<
        Extract<M, string>
      >]: MutationSchemaFor<NormalizedFromNormMap<Raw, NormMap>, MutMap[M]>;
    };
  };
}> {
  const columns = await fetchColumnMetaData(tableName);
  const rawShape: Record<string, ZodTypeAny> = {};

  for (const column of columns) {
    if (column.dataType === "USER-DEFINED") {
      switch (column.udtInfo?.kind) {
        case "enum": {
          const labels = column.udtInfo.labels ?? [];
          rawShape[column.columnName] = labels.length
            ? z.enum(labels as [string, ...string[]])
            : z.string();
          break;
        }
        case "composite":
          rawShape[column.columnName] = z.unknown();
          break;
        case "domain": {
          if (
            column.udtInfo.baseType &&
            column.udtInfo.baseType in sqlToZodMap
          ) {
            rawShape[column.columnName] = (sqlToZodMap as any)[
              column.udtInfo.baseType
            ];
          } else {
            rawShape[column.columnName] = z.unknown();
          }
          break;
        }
        default:
          rawShape[column.columnName] = z.unknown();
          break;
      }
    } else {
      rawShape[column.columnName] = sqlToZod(
        column.udtName,
        column.characterMaximumLength,
        column.numericPrecision,
        column.numericScale,
      );
    }

    if (column.columnDescription) {
      rawShape[column.columnName] = (
        rawShape[column.columnName] as any
      ).describe(column.columnDescription) as any;
    }

    if (column.isNullable) {
      rawShape[column.columnName] = (
        rawShape[column.columnName] as any
      ).nullable() as any;
    }
  }

  const rawSchema = z.object(rawShape) as unknown as ZodType<Raw, any>;

  const normalizeSchema = rawSchema.transform((value: any) => {
    const camel = keysToCamelCase(value as any) as Camelize<Raw>;
    const transformed: any = { ...camel };

    const keys = Object.keys(transforms) as (keyof typeof transforms)[];

    for (const key of keys) {
      const pair = transforms[key];
      if (!pair) continue;
      const [normalize] = pair;
      transformed[key as string] = normalize(
        camel[key as keyof Camelize<Raw>] as any,
      );
    }

    if ((value as any).created_at) {
      transformed.createdAt = new Date((value as any).created_at);
    }
    if ((value as any).updated_at) {
      transformed.updatedAt = new Date((value as any).updated_at);
    }

    return transformed;
  }) as unknown as ZodType<NormalizedFromNormMap<Raw, NormMap>, Raw>;

  const denormalizeSchema = (z.any() as ZodTypeAny).transform((norm: any) => {
    const raw: any = {};

    for (const column of columns) {
      const camelKey = toCamelCase(column.columnName) as keyof typeof norm;

      const pair = (transforms as any)[camelKey] as
        | AnyMutationConfig<any>
        | undefined;

      if (pair) {
        const [, denorm] = pair as any;
        raw[column.columnName] = denorm(norm[camelKey]);
      } else {
        raw[column.columnName] = norm[camelKey];
      }
    }

    return raw as Raw;
  }) as unknown as ZodType<Raw, NormalizedFromNormMap<Raw, NormMap>>;

  const mutationsZod: any = {};
  const mutKeys = Object.keys(mutations) as (keyof MutMap & string)[];

  for (const name of mutKeys) {
    type Norm = NormalizedFromNormMap<Raw, NormMap>;
    type Conf = MutMap[typeof name];
    const conf = mutations[name] as Conf;
    const pascal = toPascalCase(name);

    if ((conf as AnyMutationConfig<any>).kind === "patch") {
      const patchConf = conf as unknown as PatchMutationConfig<Norm, any, any>;
      mutationsZod[pascal] = {
        To: (z.any() as ZodTypeAny).transform((norm: any) => {
          const without: any = { ...norm };
          for (const k of patchConf.removedKeys as readonly (
            | string
            | number
            | symbol
          )[]) {
            delete without[k];
          }
          const patch = patchConf.to(without);
          return { ...without, ...patch };
        }) as unknown as ZodType<
          ViewFromConfig<Norm, Conf>,
          MutationToInput<Norm, Conf>
        >,
        From: (z.any() as ZodTypeAny).transform((view: any) => {
          const patchBack = patchConf.from(view);
          const merged: any = { ...view, ...patchBack };
          for (const k of patchConf.removedKeys as readonly (
            | string
            | number
            | symbol
          )[]) {
            merged[k] = undefined;
          }
          return merged;
        }) as unknown as ZodType<Partial<Norm>, ViewFromConfig<Norm, Conf>>,
      };
    } else if ((conf as AnyMutationConfig<any>).kind === "multi") {
      const multiConf = conf as unknown as MultiMutationConfig<Norm, any, any>;
      const toSchema = (z.any() as ZodTypeAny).transform((input: any) => {
        if (Array.isArray(input)) {
          const results = input.map((item: any) => multiConf.to(item));
          return results.flat();
        }
        return multiConf.to(input);
      }) as unknown as ZodType<
        ViewFromConfig<Norm, Conf>,
        MutationToInput<Norm, Conf>
      >;

      if (multiConf.from) {
        mutationsZod[pascal] = {
          To: toSchema,
          From: (z.any() as ZodTypeAny).transform((out: any) =>
            multiConf.from!(out),
          ) as unknown as ZodType<
            Norm,
            UnwrapArray<ViewFromConfig<Norm, Conf>>
          >,
        };
      } else {
        mutationsZod[pascal] = {
          To: toSchema,
        };
      }
    }
  }

  const key = toPascalCase(tableName as string) as Pascalize<Table>;

  return {
    [key]: {
      Raw: rawSchema,
      Normalize: normalizeSchema,
      Denormalize: denormalizeSchema,
      Mutations: mutationsZod,
    },
  } as {
    [K in Pascalize<Table>]: {
      Raw: ZodType<Raw, any>;
      Normalize: ZodType<NormalizedFromNormMap<Raw, NormMap>, Raw>;
      Denormalize: ZodType<Raw, NormalizedFromNormMap<Raw, NormMap>>;
      Mutations: {
        [M in keyof MutMap as PascalizeKey<
          Extract<M, string>
        >]: MutationSchemaFor<NormalizedFromNormMap<Raw, NormMap>, MutMap[M]>;
      };
    };
  };
}
