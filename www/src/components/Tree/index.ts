export { default as TreeRenderer } from "./TreeRenderer";
export { default as Tree } from "./Tree";

export namespace Orientation {
  export const NEUTRAL = 0;
  export const ABOVE = 1;
  export const BELOW = 2;

  export type Type = typeof NEUTRAL | typeof ABOVE | typeof BELOW;
}
