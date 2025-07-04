export type ButterflyStackVerticalDepth = number;
export type ButterflyStackHorizontalDepth = number;

export interface ButterflyStackDepth {
  vertical: ButterflyStackVerticalDepth;
  horizontal: ButterflyStackHorizontalDepth;
}

export interface ButterflyStackPoint<Value> {
  depth: ButterflyStackDepth;
  value: Value;
}

export type ButterflyStackInsertion = () => {};

export type ButterflyStackVerticalDepthOperator = (
  verticalDepth: number,
) => number;
