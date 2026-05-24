import { toCamelCase } from "./toCamelCase";
import type { KeysToCamelCase } from "./types";

/**
 * Convert all own-enumerable keys of an object to camelCase.
 *
 * - Recursively converts nested objects and arrays
 * - Preserves non-object values (Date, RegExp, functions, primitives)
 * - Returns a new object; does not mutate the input
 */
export function keysToCamelCase<T extends unknown>(value: T): KeysToCamelCase<T> {
  if (value == null) return value as any;

  if (Array.isArray(value)) {
    return value.map(v => keysToCamelCase(v)) as any;
  }

  if (
    typeof value !== "object" ||
    value instanceof Date ||
    value instanceof RegExp
  ) {
    return value as any;
  }

  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const newKey = toCamelCase(k as string);
    out[newKey] = keysToCamelCase(v);
  }

  return out as KeysToCamelCase<T>;
}
