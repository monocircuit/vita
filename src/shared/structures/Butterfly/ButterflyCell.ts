import { ButterflyDepth, ButterflyLinkage } from "./types";

/**
 * @author Lukas Diegelmann
 *
 * A `ButterflyCell` represents a single entry in the `Butterfly` data structure
 * at coordinates `(y, x)`, where:
 * - `y` is the vertical position (the layer in the stack),
 * - `x` is the horizontal position within that layer.
 *
 * Each cell contains:
 * - The actual `content` of type `Value`
 * - Linkage information (`next` and `prev`) inherited from {@link ButterflyLinkage},
 *   which can be used to establish semantic connections between cells on the same
 *   Y-level that are not directly adjacent in the X-dimension.
 *
 * If no linkage was defined, the `next` and `prev` functions will return `null`.
 *
 * @typeParam Value - The type of the content stored inside the cell.
 */
export class ButterflyCell<T> implements ButterflyLinkage<T>, ButterflyDepth {
  /* Holds the content of the ButterflyCell */
  public readonly $: T;

  /* Making the `ButterflyCell` able to connect with other `ButterflyCells`
     inside the `Butterfly`. */
  public prev: null | ButterflyCell<T> = null;
  public next: null | ButterflyCell<T> = null;

  /* Making the `ButterflyCell` aware of its own depth inside the `Butterfly` */
  public x: number = NaN;
  public y: number = NaN;

  /* Enable flagging of a `ButterflyCell` */
  private _flag: boolean = false;

  constructor(
    $: T,
    options?: {
      depth: ButterflyDepth;
      linkage?: ButterflyLinkage<T>;
    },
  ) {
    this.$ = $;

    if (options?.linkage) {
      this.next = options?.linkage.next;
      this.prev = options?.linkage.prev;
    }

    if (options?.depth) {
      this.x = options.depth.x;
      this.y = options.depth.y;
    }
  }

  get isFlagged() {
    return this._flag;
  }

  public flag(): boolean {
    this._flag = true;
    return this._flag;
  }

  public unflag() {
    this._flag = false;
    return this._flag;
  }
}

export default ButterflyCell;
