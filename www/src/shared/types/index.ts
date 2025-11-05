/**
 * Extracts the resolved (inner) type from a `Promise`.
 *
 * This utility type unwraps a promise type to get its resolved value type.
 * If `T` is not a `Promise`, it simply returns `T` unchanged.
 *
 * @example
 * ```ts
 * type Result = Awaited<Promise<string>>; // string
 * type Direct = Awaited<number>;          // number
 * ```
 *
 * @template T - The type to unwrap. Can be a `Promise` or any other type.
 * @returns The unwrapped type if `T` is a `Promise`, otherwise `T` itself.
 *
 * @author Lukas Diegelmann
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;
