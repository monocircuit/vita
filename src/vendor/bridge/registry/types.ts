import type { AnyTableBuilder } from "../table";

/** Built object shape returned by a single table builder. */
type SchemaObjFromBuilder<B extends AnyTableBuilder> = Awaited<
  ReturnType<B["build"]>
>;

/** Top-level schema key produced by a builder (for example `Chronicles`). */
export type SchemaKeyFromBuilder<B extends AnyTableBuilder> =
  keyof SchemaObjFromBuilder<B>;

/** Schema value type produced under the builder's schema key. */
export type SchemaFromBuilder<B extends AnyTableBuilder> =
  SchemaObjFromBuilder<B>[SchemaKeyFromBuilder<B>];

/**
 * Merges a tuple of table builders into one typed schema map.
 */
export type MapFromBuilders<TBuilders extends readonly AnyTableBuilder[]> = {
  [B in TBuilders[number] as SchemaKeyFromBuilder<B>]: SchemaFromBuilder<B>;
};
