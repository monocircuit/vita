import { toSnakeCase } from "./toSnakeCase";
import type { KeysToSnakeCase } from "./types";

/**
 * Convert all own-enumerable keys of an object to snake_case.
 *
 * - Recursively converts nested objects and arrays
 * - Preserves non-object values (Date, RegExp, functions, primitives)
 * - Returns a new object; does not mutate the input
 */
export function keysToSnakeCase<T extends unknown>(
  value: T,
): KeysToSnakeCase<T> {
  if (value == null) return value as any;

  if (Array.isArray(value)) {
    return value.map(v => keysToSnakeCase(v)) as any;
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
    const newKey = toSnakeCase(k as string);
    out[newKey] = keysToSnakeCase(v);
  }

  return out as KeysToSnakeCase<T>;
}

export default keysToSnakeCase;
