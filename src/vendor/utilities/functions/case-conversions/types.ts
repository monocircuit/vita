/**
 * Type utilities for converting between common case styles.
 * These are computed string types used only at compile time.
 */
/**
 * Convert string literal types to `snake_case` at compile time.
 * Also acts as a recursive mapper when given an object/array type.
 *
 * Usage:
 * - `Snakeize<'fooBar'>` -> `'foo_bar'`
 * - `Snakeize<{ someKey: number }>` -> `{ some_key: number }
 */
export type Snakeize<T> =
  // string case: convert characters
  T extends string
    ? T extends `${infer A}${infer B}`
      ? B extends Uncapitalize<B>
        ? `${Lowercase<A>}${Snakeize<B>}`
        : `${Lowercase<A>}_${Snakeize<Uncapitalize<B>>}`
      : Lowercase<T>
    : // array/tuple: map elements
      T extends readonly any[]
      ? { [K in keyof T]: Snakeize<T[K]> }
      : // preserve Date/RegExp etc.
        T extends Date
        ? T
        : // object: map keys and recurse on values
          T extends object
          ? {
              [K in keyof T as K extends string ? Snakeize<K> : K]: Snakeize<
                T[K]
              >;
            }
          : T;

/**
 * Convert string literal types to `PascalCase` at compile time.
 * Also acts as a recursive mapper when given an object/array type.
 */
export type Pascalize<T> = T extends string
  ? Snakeize<T> extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${Pascalize<Tail>}`
    : Capitalize<Snakeize<T>>
  : T extends readonly any[]
    ? { [K in keyof T]: Pascalize<T[K]> }
    : T extends object
      ? {
          [K in keyof T as K extends string ? Pascalize<K> : K]: Pascalize<
            T[K]
          >;
        }
      : T;

/**
 * Convert string literal types to `camelCase` at compile time.
 * Also acts as a recursive mapper when given an object/array type.
 */
export type Camelize<T> = T extends string
  ? Uncapitalize<Pascalize<T>>
  : T extends readonly any[]
    ? { [K in keyof T]: Camelize<T[K]> }
    : T extends object
      ? { [K in keyof T as K extends string ? Camelize<K> : K]: Camelize<T[K]> }
      : T;

/**
 * Recursively maps the keys of a type to their snake_case equivalent.
 * - arrays and tuples are preserved and their element types are mapped
 * - primitive values are left as-is
 */
export type KeysToSnakeCase<T> = T extends readonly (infer U)[]
  ? KeysToSnakeCase<U>[]
  : T extends Date
    ? T
    : T extends object
      ? { [K in keyof T as Snakeize<string & K>]: KeysToSnakeCase<T[K]> }
      : T;

/**
 * Recursively maps the keys of a type to their camelCase equivalent.
 * - arrays and tuples are preserved and their element types are mapped
 * - primitive values (including string literals) are left as-is
 *
 * Prefer this over `Camelize<T>` when `T` is an object/row type. `Camelize<T>`
 * also transforms string *values* (e.g. enum literals like "DYNAMIC" become
 * "dYNAMIC"), which diverges from `keysToCamelCase`'s runtime behavior.
 */
export type KeysToCamelCase<T> = T extends readonly (infer U)[]
  ? KeysToCamelCase<U>[]
  : T extends Date
    ? T
    : T extends object
      ? { [K in keyof T as Camelize<string & K>]: KeysToCamelCase<T[K]> }
      : T;
