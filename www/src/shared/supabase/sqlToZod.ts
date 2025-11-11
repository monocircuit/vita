import { z } from "zod";

// 1) Canonical map (compile-time checked)
export const sqlToZodMap = {
  bigint: z.number(),
  int8: z.number(),
  int4: z.number(),
  int2: z.number(),
  smallint: z.number(),
  integer: z.number(),
  numeric: z.number(),
  real: z.number(),
  float8: z.number(),
  double: z.number(),

  text: z.string(),
  varchar: z.string(),
  uuid: z.string(),
  json: z.any(),
  jsonb: z.any(),

  bool: z.boolean(),
  boolean: z.boolean(),

  date: z.string().datetime({ offset: true }),
  timestamp: z.string().datetime({ offset: true }),
  timestamptz: z.string().datetime({ offset: true }),

  // arrays
  _int2: z.array(z.number()),
  _int4: z.array(z.number()),
  _text: z.array(z.string()),
  _uuid: z.array(z.string()),
} as const satisfies Record<string, z.ZodTypeAny>;

// 2) Exact union of allowed SQL types
export type SqlType = keyof typeof sqlToZodMap;

// 3) Perfectly-typed mapper
export function sqlToZod<T extends SqlType>(
  sqlType: T,
): (typeof sqlToZodMap)[T] {
  return sqlToZodMap[sqlType];
}
