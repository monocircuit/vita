import { z, ZodSchema, ZodTypeAny } from "zod";

// 1) Canonical map (compile-time checked)
export const sqlToZodMap = {
  // --------- Integers ---------
  // bigint: z.string().regex(/^-?\d+$/),
  // int8: z.string().regex(/^-?\d+$/),
  int8: z.number(),
  bigint: z.number(),

  // 32/16-bit: sicher als JS number
  int4: z.number(),
  integer: z.number(),
  int2: z.number(),
  smallint: z.number(),

  // Arbitrary precision → niemals garantiert sicher als JS number
  numeric: z.string(), // z.string().regex(/^-?\d+(\.\d+)?$/) o.ä.

  // --------- Floats ---------
  real: z.number(), // float4
  float8: z.number(), // float8 / double precision
  double: z.number(),

  // --------- Text / UUID / JSON ---------
  text: z.string(),
  varchar: z.string(),
  uuid: z.string().uuid(),

  json: z.unknown(), // statt any: etwas „ehrlicher“
  jsonb: z.unknown(),

  // --------- Boolean ---------
  bool: z.boolean(),
  boolean: z.boolean(),

  // --------- Datum / Zeit ---------
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // 'YYYY-MM-DD'
  timestamp: z.string().datetime(), // ISO-Timestamp
  timestamptz: z.string().datetime({ offset: true }), // ISO-Timestamp mit Offset

  // --------- Arrays ---------
  _int2: z.array(z.number()),
  _int4: z.array(z.number()),
  _text: z.array(z.string()),
  _uuid: z.array(z.string().uuid()),
  _json: z.array(z.unknown()), // Für JSON Arrays
  _date: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  _boolean: z.array(z.boolean()), // Für Boolean Arrays
} as const satisfies Record<string, ZodTypeAny>;

// 2) Erweiterte sqlToZod, die mehrere Argumente akzeptiert
export function sqlToZod<T extends keyof typeof sqlToZodMap>(
  sqlType: T,
  characterMaximumLength?: number | null,
  numericPrecision?: number | null,
  numericScale?: number | null,
  maxArrayLength?: number | null,
): ZodTypeAny {
  // Zuerst den entsprechenden Zod-Typ aus der Map holen
  let schema: ZodSchema = sqlToZodMap[sqlType];

  // Zusätzliche Parameter verarbeiten
  switch (sqlType) {
    case "varchar":
    case "text":
      if (characterMaximumLength) {
        // Wenn eine maxLength existiert, wende es auf den String-Validator an
        schema = (schema as z.ZodString).max(characterMaximumLength);
      }
      break;

    case "numeric":
      if (numericPrecision && numericScale) {
        // Beispiel: Präzision und Skalierung für numerische Werte anwenden
        schema = (schema as z.ZodString).refine(val => {
          const maxValue = Math.pow(10, numericPrecision - numericScale) - 1; // Für die genauen Werte der Präzision
          return parseFloat(val) <= maxValue;
        }, `Wert überschreitet die erlaubte Präzision und Skalierung.`);
      }
      break;
  }

  return schema;
}
