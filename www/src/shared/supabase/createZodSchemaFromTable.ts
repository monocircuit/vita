import zod, {
  RefinementCtx,
  ZodEffects,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from "zod";
import { sqlToZod, sqlToZodMap } from "@/utils/sqlToZod";
import fetchColumnMetaData from "./fetchColumnMetaData";
import {
  Camelize,
  snakeToCamelFromObject,
} from "@/utils/case-conversions/snakeCaseToCamelCase";
import {
  Pascalize,
  snakeCaseToPascalCase,
} from "@/utils/case-conversions/snakeCaseToPascalCase";

/*
 * TODO: Make Raw a Zod.Effect in order to facilitate denormalization
 */

async function createZodSchemaFromTable<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object = Database["public"]["Tables"][Table]["Row"],
  Patch extends object = {},
>(
  tableName: Table,
  transformToNorm?: (
    value: Omit<Camelize<Raw>, "createdAt" | "updatedAt">,
    ctx: RefinementCtx,
  ) => Patch,
): Promise<{
  [K in `$${Pascalize<Table>}`]: {
    Raw: ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>;
    Normalized: ZodEffects<
      ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw>,
      Omit<Camelize<Raw>, keyof Patch> & Patch,
      Raw
    >;
  };
}> {
  /* fetch meta information of columns from supabase */
  const columns = await fetchColumnMetaData(tableName);
  const rawShape: ZodRawShape = {};

  for (const column of columns) {
    if (column.dataType === "USER-DEFINED") {
      switch (column.udtInfo?.kind) {
        case "enum":
          const labels = column.udtInfo.labels ?? [];

          if (labels.length === 0) {
            /* Empty Enum (should never happen) */
            rawShape[column.columnName] = zod.string();
          } else {
            rawShape[column.columnName] = zod.enum(
              labels as [string, ...string[]],
            );
          }
          break;
        case "composite":
          /* Composite types (Row-types / Typed Structs) */
          /* TODO: Composite Types are currently not implementend */
          rawShape[column.columnName] = zod.unknown();
          break;
        case "domain":
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

  const rawSchema: ZodObject<ZodRawShape, "strip", ZodTypeAny, Raw, Raw> =
    zod.object(rawShape) as any;

  /* TODO: append descriptions and meta information to the norm schema */
  const normSchema = rawSchema.transform((value, ctx) => ({
    /*
     * Import the camlized raw schema, as this is the base for every table,
     * then follow the user defined changes.
     */
    ...snakeToCamelFromObject(value as any),
    /*
     * Import the normalization patch into the norm schema, this is the part
     * the user defined themself.
     */
    ...(transformToNorm
      ? transformToNorm(
          snakeToCamelFromObject(value as any) as Camelize<Raw>,
          ctx,
        )
      : {}),
    /*
     * Generally handle the conversion of every createdAt and updatedAt
     * timestamp, as this has to happen for every table it can be abstracted
     * here.
     */
    ...{
      createdAt: (value as any).created_at
        ? new Date((value as any).created_at)
        : null,
      updatedAt: (value as any).updated_at
        ? new Date((value as any).updated_at)
        : null,
    },
  }));

  return {
    [`$${snakeCaseToPascalCase(tableName)}`]: {
      Raw: rawSchema,
      Normalized: normSchema,
    },
  } as any;
}

export interface InferZodTableSchema<
  S extends { Raw: ZodTypeAny; Normalized: ZodTypeAny },
> {
  Raw: zod.infer<S["Raw"]>;
  Normalized: zod.infer<S["Normalized"]>;
}

export default createZodSchemaFromTable;
