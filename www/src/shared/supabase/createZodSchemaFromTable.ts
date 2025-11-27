import zod, { ZodEffects, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { sqlToZod, sqlToZodMap } from "@/utils/sqlToZod";
import fetchColumnMetaData from "./fetchColumnMetaData";
import {
  Camelize,
  snakeToCamelFromObject,
  snakeToCamel,
} from "@/utils/case-conversions/snakeCaseToCamelCase";
import {
  Pascalize,
  snakeCaseToPascalCase,
} from "@/utils/case-conversions/snakeCaseToPascalCase";

export const map = {};

/* ============================================================================================
 * TRANSFORM TYPES
 * ============================================================================================ */

type ColumnTransformationPair<C, N> = [(raw: C) => N, (norm: N) => C];

/** Laufzeit-Map (enthält die eigentlichen Funktionen) */
type RuntimeTransformMap<Raw extends object> = {
  [K in keyof Camelize<Raw>]?: ColumnTransformationPair<Camelize<Raw>[K], any>;
};

/** Typ-Level-Map der normalisierten Felder */
type NormMapBase<Raw extends object> = Partial<
  Record<keyof Camelize<Raw>, any>
>;

type NormalizedFromNormMap<
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
> = {
  [K in keyof Camelize<Raw>]: K extends keyof NormMap
    ? NormMap[K]
    : Camelize<Raw>[K];
};

/* ============================================================================================
 * FLUENT API
 * ============================================================================================ */

export function table<Table extends keyof Database["public"]["Tables"]>(
  tableName: Table,
) {
  type Raw = Database["public"]["Tables"][Table]["Row"];
  return new TableBuilder<Table, Raw, {}>(tableName);
}

/* TABLE BUILDER ------------------------------------------------------------ */

class TableBuilder<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object,
  NormMap extends NormMapBase<Raw> = {},
> {
  constructor(
    public readonly tableName: Table,
    public readonly transforms: RuntimeTransformMap<Raw> = {} as any,
  ) {}

  column<K extends keyof Camelize<Raw>>(key: K) {
    return new ColumnBuilderPre<Table, Raw, NormMap, K>(this, key);
  }

  async build() {
    return createZodSchemaFromTableInternal<Table, Raw, NormMap>(
      this.tableName,
      this.transforms,
    );
  }
}

/* COLUMN BUILDER PRE-NORMALIZE ------------------------------------------- */

class ColumnBuilderPre<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
  K extends keyof Camelize<Raw>,
> {
  constructor(
    public readonly parent: TableBuilder<Table, Raw, NormMap>,
    public readonly key: K,
  ) {}

  normalize<N>(
    fn: (raw: Camelize<Raw>[K]) => N,
  ): ColumnBuilderPost<Table, Raw, NormMap & { [P in K]: N }, K, N> {
    this.parent.transforms[this.key] = [fn, undefined] as any;

    type NewNormMap = NormMap & { [P in K]: N };

    return new ColumnBuilderPost<Table, Raw, NewNormMap, K, N>(
      this.parent as any,
      this.key,
    );
  }
}

/* COLUMN BUILDER POST-NORMALIZE ------------------------------------------ */

class ColumnBuilderPost<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object,
  NormMap extends NormMapBase<Raw>,
  K extends keyof Camelize<Raw>,
  NormK,
> {
  constructor(
    public readonly parent: TableBuilder<Table, Raw, any>,
    public readonly key: K,
  ) {}

  denormalize(
    fn: (norm: NormK) => Camelize<Raw>[K],
  ): TableBuilder<Table, Raw, NormMap> {
    const pair = this.parent.transforms[this.key]!;
    pair[1] = fn;

    return new TableBuilder<Table, Raw, NormMap>(
      this.parent.tableName,
      this.parent.transforms,
    );
  }
}

/* ============================================================================================
 * INTERNAL SCHEMA CREATION LOGIC
 * ============================================================================================ */

async function createZodSchemaFromTableInternal<
  Table extends keyof Database["public"]["Tables"],
  Raw extends object = Database["public"]["Tables"][Table]["Row"],
  NormMap extends NormMapBase<Raw> = {},
>(
  tableName: Table,
  transforms: RuntimeTransformMap<Raw>,
): Promise<{
  [K in `$${Pascalize<Table>}`]: {
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
  };
}> {
  /* 1. Spalten-Metadaten laden */
  const columns = await fetchColumnMetaData(tableName);
  const rawShape: ZodRawShape = {};

  /* 2. Raw-Zod-Schema aufbauen */
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

  /* 3. Normalize: Raw -> Normalized (CamelCase + custom normalize + timestamps) */
  const normalizeSchema = rawSchema.transform(value => {
    const camel = snakeToCamelFromObject(value as any) as Camelize<Raw>;
    const transformed: any = { ...camel };

    // user-definierte normalize-Funktionen anwenden
    for (const key in transforms) {
      const [normalize] = transforms[key]!;
      transformed[key] = normalize(camel[key as keyof typeof camel]);
    }

    // generelles createdAt/updatedAt-Handling
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

  /* 4. Denormalize: Normalized -> Raw (custom denormalize + Camel -> Snake) */
  const denormalizeSchema = (zod.any() as ZodTypeAny).transform((norm: any) => {
    const raw: any = {};

    for (const column of columns) {
      const camelKey = snakeToCamel(column.columnName) as keyof typeof norm;

      if ((transforms as any)[camelKey]) {
        const [, denorm] = (transforms as any)[camelKey]!;
        raw[column.columnName] = denorm(norm[camelKey]);
      } else {
        raw[column.columnName] = norm[camelKey];
      }
    }

    return raw as Raw;
  }) as ZodEffects<ZodTypeAny, Raw, NormalizedFromNormMap<Raw, NormMap>>;

  /* 5. Ergebnis zurückgeben */
  return {
    [`$${snakeCaseToPascalCase(tableName)}`]: {
      Raw: rawSchema,
      Normalize: normalizeSchema,
      Denormalize: denormalizeSchema,
    },
  } as any;
}

/* ============================================================================================
 * INFER
 * ============================================================================================ */

export interface InferZodTableSchema<
  S extends {
    Raw: ZodTypeAny;
    Normalize: ZodTypeAny;
    Denormalize: ZodTypeAny;
  },
> {
  Raw: zod.infer<S["Raw"]>;
  Normalized: zod.infer<S["Normalize"]>;
  Denormalized: zod.infer<S["Denormalize"]>;
}
