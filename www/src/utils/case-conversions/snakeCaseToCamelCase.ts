import zod from "zod";
import mapObject from "../mapObject";

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function snakeToCamelFromObject<T extends Record<string, unknown>>(
  record: T,
): Camelize<T> {
  return mapObject(record, (key, value) => [
    snakeToCamel(key as string),
    value,
  ]) as Camelize<T>;
}

export type CamelizedZodObject<TShape extends zod.ZodRawShape> = zod.ZodObject<{
  [K in keyof TShape as K extends string
    ? SnakeToCamelCaseHelper<K>
    : K]: TShape[K];
}>;

export function snakeToCamelFromZodSchema<TShape extends zod.ZodRawShape>(
  schema: zod.ZodObject<TShape>,
): CamelizedZodObject<TShape> {
  const shape = schema.shape;
  const newShape: zod.ZodRawShape = {};

  for (const key in shape) {
    const field = shape[key];
    const camelKey = snakeToCamel(key);

    // Rekursiv für verschachtelte Objekte
    if (field instanceof zod.ZodObject) {
      newShape[camelKey] = snakeToCamelFromZodSchema(field as any);
      continue;
    }

    // Arrays behandeln (z.B. array of objects)
    if (field instanceof zod.ZodArray) {
      const inner = (field as zod.ZodArray<zod.ZodTypeAny>)._def.type;

      if (inner instanceof zod.ZodObject) {
        newShape[camelKey] = zod.array(
          snakeToCamelFromZodSchema(inner as any),
        ) as any;
      } else {
        newShape[camelKey] = field;
      }

      continue;
    }

    // Alle anderen Typen 1:1 übernehmen
    newShape[camelKey] = field;
  }

  return zod.object(newShape) as any;
}

type SnakeToCamelCaseHelper<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamelCaseHelper<Tail>>}`
    : S;

export type Camelize<T extends object> = {
  [K in keyof T as K extends string ? SnakeToCamelCaseHelper<K> : K]: T[K];
};

export default snakeToCamel;
