import zod, { ZodEffects, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
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
  ViewFromConfig,
  AnyMutationConfig,
  MultiMutationConfig,
} from "./types";

/**
 * Helper type to build the mutation schema shape.
 * - If the mutation has `from` (reversible), include both `To` and `From`
 * - If the mutation has no `from` (data-loss), only include `To`
 */
type MutationSchemaFor<Norm, Conf> =
  Conf extends MultiMutationConfig<Norm, infer Out, infer HasFrom>
    ? HasFrom extends true
      ? {
          To: ZodEffects<ZodTypeAny, Out, Norm>;
          From: ZodEffects<ZodTypeAny, Norm, Out>;
        }
      : {
          To: ZodEffects<ZodTypeAny, Out, Norm>;
        }
    : {
        To: ZodEffects<ZodTypeAny, ViewFromConfig<Norm, Conf>, Norm>;
        From: ZodEffects<ZodTypeAny, Norm, ViewFromConfig<Norm, Conf>>;
      };

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
    Raw: ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>;
    Normalize: ZodEffects<
      ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>,
      NormalizedFromNormMap<Raw, NormMap>,
      Raw
    >;
    Denormalize: ZodEffects<
      ZodTypeAny,
      Raw,
      NormalizedFromNormMap<Raw, NormMap>
    >;
    Mutations: {
      [M in keyof MutMap as PascalizeKey<
        Extract<M, string>
      >]: MutationSchemaFor<NormalizedFromNormMap<Raw, NormMap>, MutMap[M]>;
    };
  };
}> {
  const columns = await fetchColumnMetaData(tableName);
  const rawShape: ZodRawShape = {};

  for (const column of columns) {
    if (column.dataType === "USER-DEFINED") {
      switch (column.udtInfo?.kind) {
        case "enum": {
          const labels = column.udtInfo.labels ?? [];
          rawShape[column.columnName] = labels.length
            ? zod.enum(labels as [string, ...string[]])
            : zod.string();
          break;
        }
        case "composite":
          rawShape[column.columnName] = zod.unknown();
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
            rawShape[column.columnName] = zod.unknown();
          }
          break;
        }
        default:
          rawShape[column.columnName] = zod.unknown();
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
      rawShape[column.columnName] = rawShape[column.columnName].describe(
        column.columnDescription,
      );
    }

    if (column.isNullable) {
      rawShape[column.columnName] = rawShape[column.columnName].nullable();
    }
  }

  const rawSchema = zod.object(rawShape) as ZodObject<
    ZodRawShape,
    "strip",
    ZodTypeAny,
    Raw,
    Raw
  >;

  const normalizeSchema = rawSchema.transform(value => {
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
  }) as unknown as ZodEffects<
    typeof rawSchema,
    NormalizedFromNormMap<Raw, NormMap>,
    Raw
  >;

  const denormalizeSchema = (zod.any() as ZodTypeAny).transform((norm: any) => {
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
  }) as ZodEffects<ZodTypeAny, Raw, NormalizedFromNormMap<Raw, NormMap>>;

  const mutationsZod: any = {};
  const mutKeys = Object.keys(mutations) as (keyof MutMap & string)[];

  for (const name of mutKeys) {
    const conf = mutations[name] as AnyMutationConfig<any>;
    const pascal = toPascalCase(name);

    if (conf.kind === "patch") {
      mutationsZod[pascal] = {
        To: (zod.any() as ZodTypeAny).transform((norm: any) => {
          const without: any = { ...norm };
          for (const k of conf.removedKeys as readonly (
            | string
            | number
            | symbol
          )[]) {
            delete without[k];
          }
          const patch = conf.to(without);
          return { ...without, ...patch };
        }),
        From: (zod.any() as ZodTypeAny).transform((view: any) => {
          const patchBack = conf.from(view);
          const merged: any = { ...view, ...patchBack };
          for (const k of conf.removedKeys as readonly (
            | string
            | number
            | symbol
          )[]) {
            merged[k] = undefined;
          }
          return merged;
        }),
      };
    } else if (conf.kind === "multi") {
      const toSchema = (zod.any() as ZodTypeAny).transform((input: any) => {
        // If input is an array, map each element through `to` and flatten results
        if (Array.isArray(input)) {
          const results = input.map((item: any) => conf.to(item));
          // Flatten if `to` returns arrays (e.g., one chronicle → multiple linear chronicles)
          return results.flat();
        }
        // Single item: just call `to` directly
        return conf.to(input);
      });

      // Only include `From` if `from` is defined (reversible mutation)
      if (conf.from) {
        mutationsZod[pascal] = {
          To: toSchema,
          From: (zod.any() as ZodTypeAny).transform((out: any) =>
            conf.from!(out),
          ),
        };
      } else {
        // Data-loss mutation: only `To` is available
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
      Raw: ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>;
      Normalize: ZodEffects<
        ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>,
        NormalizedFromNormMap<Raw, NormMap>,
        Raw
      >;
      Denormalize: ZodEffects<
        ZodTypeAny,
        Raw,
        NormalizedFromNormMap<Raw, NormMap>
      >;
      Mutations: {
        [M in keyof MutMap as PascalizeKey<
          Extract<M, string>
        >]: MutationSchemaFor<NormalizedFromNormMap<Raw, NormMap>, MutMap[M]>;
      };
    };
  };
}
