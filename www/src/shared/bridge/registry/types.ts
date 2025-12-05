import type { AnyTableBuilder } from "@/shared/bridge/table";

type SchemaObjFromBuilder<B extends AnyTableBuilder> = Awaited<
  ReturnType<B["build"]>
>;
export type SchemaKeyFromBuilder<B extends AnyTableBuilder> =
  keyof SchemaObjFromBuilder<B>;
export type SchemaFromBuilder<B extends AnyTableBuilder> =
  SchemaObjFromBuilder<B>[SchemaKeyFromBuilder<B>];

export type MapFromBuilders<TBuilders extends readonly AnyTableBuilder[]> = {
  [B in TBuilders[number] as SchemaKeyFromBuilder<B>]: SchemaFromBuilder<B>;
};
