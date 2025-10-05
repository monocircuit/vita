import BipolarDoublyLinkedList from "./BipolarDoublyLinkedList";
import { DoublyLinkedList } from "./DoublyLinkedList";

export interface IButterflyDepth {
  x: number;
  y: number;
}

/**
 * @author Lukas Diegelmann
 *
 * The `ButterflyLinkage` connects two cells that do not have consecutive x coordinates
 * and are in the same y coordinate. It can be used to semantically group different cells
 * depending on the use case.
 *
 * Should the `next` or `prev` connection not exist (meaning the user of `Butterfly`) did
 * not instantiate such a connection, these functions will return `null`, indicating that
 * there is no connection.
 */
export interface IButterflyLinkage<T> {
  next: ButterflyCell<T> | null;
  prev: ButterflyCell<T> | null;
}

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
 * - Linkage information (`next` and `prev`) inherited from {@link IButterflyLinkage},
 *   which can be used to establish semantic connections between cells on the same
 *   Y-level that are not directly adjacent in the X-dimension.
 *
 * If no linkage was defined, the `next` and `prev` functions will return `null`.
 *
 * @typeParam Value - The type of the content stored inside the cell.
 */
export class ButterflyCell<T> implements IButterflyLinkage<T>, IButterflyDepth {
  public readonly $: T;

  /* Making the `ButterflyCell` able to connect with other `ButterflyCells`
     inside the `Butterfly`. */
  public prev: null | ButterflyCell<T> = null;
  public next: null | ButterflyCell<T> = null;

  /* Making the `ButterflyCell` aware of its own depth inside the `Butterfly` */
  public x: number = NaN;
  public y: number = NaN;

  constructor(
    $: T,
    options?: { depth: IButterflyDepth; linkage?: IButterflyLinkage<T> },
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
}

/**
 * @author ChatGPT5
 *
 * A `ButterflyLevel` is a horizontal row of cells in the Butterfly structure.
 * It extends a standard {@link DoublyLinkedList}, but provides iterators
 * that expose both the X-coordinate and the associated `ButterflyCell<Value>`.
 *
 * @typeParam Value The type of content stored inside each ButterflyCell.
 */
class ButterflyLevel<T> extends DoublyLinkedList<
  ButterflyCell<T>,
  { x: number; cell: ButterflyCell<T> }
> {
  constructor() {
    super();
  }

  protected project(
    cell: ButterflyCell<T>,
    index: number,
  ): { x: number; cell: ButterflyCell<T> } {
    return { x: index, cell };
  }
}

/**
 * @author Lukas Diegelmann
 *
 * The `Butterfly` is a data structure that internally handels a two dimensional
 * `BipolarDoublyLinkedList`. While the first dimension (the y or vertical dimension)
 * can have positive, neutral and negative indices, the second dimension (the x or
 * horizontal dimension) can only have neutral or positive indices. Additionally the
 * `Butterfly` makes linking between different cells possible.
 *
 * One entry in the `Butterfly` consisting of the type `Value & ButterflyLinkage` is
 * called a cell.
 *
 * A one dimensional group of cells (`BipolarDoublyLinkedList<Value>`) is called a
 * level.
 */
export default class Butterfly<T> {
  private store: BipolarDoublyLinkedList<
    ButterflyLevel<T>,
    { y: number; level: ButterflyLevel<T> }
  >;

  constructor() {
    this.store = new BipolarDoublyLinkedList({
      project: entry => {
        return { level: entry.value, y: entry.index };
      },
    });
  }

  protected project(
    level: ButterflyLevel<T>,
    y: number,
  ): { y: number; level: ButterflyLevel<T> } {
    return { level, y };
  }

  /**
   * @author Lukas Diegelmann
   *
   * Return the latest points of each layer in the stack, i.e. the points at the right end of each layer
   *
   * The order of the points is:
   * 1. The latest point of the neutral layer (if it exists)
   * 2. The latest points of the positive and negative layers, alternating between positive and negative,
   */
  public getLastCells() {
    const cells: ButterflyCell<T>[] = [];

    /** Alternating between positive and negative levels and 
        pushing vectors in (starting with the neutral level) */
    for (const { y } of this.store) {
      const result = this.getLastCell(y);

      if (result) {
        cells.push(result);
      }
    }

    return cells;
  }

  public getLevel(y: number) {
    return this.store.get(y);
  }

  public doesLevelExist(y: number) {
    return !!this.store.get(y);
  }

  public get(y: number, x: number) {
    const level = this.getLevel(y);

    if (level) {
      return level.get(x);
    }
  }

  /**
   * @author Lukas Diegelmann
   *
   * Insert or update a value at the given coordinates (`y`, `x`) in the butterfly structure.
   *
   * Behavior:
   * - If the Y-level (`y`) already exists:
   *   The method delegates to the underlying level’s `set(x, value)` function,
   *   updating the node at X-index `x` or appending it if the position is valid.
   *
   * - If the Y-level does not yet exist:
   *   A new `BipolarDoublyLinkedList` is created for this `y` index,
   *   and then the value is inserted at the given `x` position.
   *   When inserting into a newly created level, the `value` is augmented
   *   with a default `linkage` object whose `next()` and `prev()` functions
   *   both return `null`, ensuring proper initialization of linkage data.
   *
   * @param y - The Y-coordinate (level index) to insert into.
   * @param x - The X-coordinate within that level.
   * @param value - The value to store. If the level is created in this call,
   *   the value will be wrapped with a default `linkage` structure.
   * @returns `true` if the value was successfully set,
   *          `false` if the operation failed (e.g., invalid position).
   *
   * @example
   * // Insert into an existing level
   * butterfly.set(1, 0, { title: "Chronicle A", knots: { start: 0, end: 100 } });
   *
   * // Insert into a new level (level 2 is created automatically)
   * butterfly.set(2, 0, { title: "Chronicle B", knots: { start: 200, end: 300 } });
   */
  public set(y: number, x: number, value: T): null | ButterflyCell<T> {
    // Create Butterfly Cell
    const cell = new ButterflyCell(value, {
      depth: {
        x: x,
        y: y,
      },
      linkage: {
        next: null,
        prev: null,
      },
    });

    // Check if level already exists
    const level = this.getLevel(y);

    if (level) {
      // If the level already exists, the algorithm can just set the value at x
      return level.set(x, cell);
    }

    // Should the level not already exists
    const hasSucceeded = this.store.set(y, new ButterflyLevel());
    const newLevel = this.store.get(y);

    if (hasSucceeded && newLevel) {
      // If the operation to create the new level has succeeded, the algorith
      // can now add the value at the desired `x` spot
      return newLevel.set(x, cell);
    }

    /* should none of these operations have worked return the null pointer */
    return null;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Append a new value to a given Y-level in the butterfly.
   *
   * Behavior:
   * - If the level at `y` already exists:
   *   The new value is appended at the next available X-index,
   *   i.e. `x = level.length`. This ensures that values are
   *   stored sequentially without gaps along the X-axis.
   *
   * - If the level at `y` does not exist yet:
   *   A new level is created internally, and the value is placed
   *   at `x = 0` as the first entry in that level.
   *
   * @param y - The Y-coordinate (level index) where the value should be pushed.
   * @param value - The value to insert at the end of the level.
   * @returns `true` if the value was successfully added,
   *          `false` if the operation failed (e.g., invalid position).
   */
  public push(y: number, value: T): null | ButterflyCell<T> {
    /** Check if level already exists */
    const level = this.getLevel(y);

    if (level) {
      /** If the level already exists, append at the next index */
      return this.set(y, level.length, value);
    } else {
      /** If the level does not exist, start at index 0 */
      return this.set(y, 0, value);
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate over all Y-levels in the default alternating order.
   *
   * Order:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * Starts with the neutral level (y=0), then alternates between
   * positive and negative indices, moving one step further away
   * from the origin on each iteration.
   */
  protected *iterateY(): IterableIterator<{
    y: number;
    level: ButterflyLevel<T>;
  }> {
    for (const node of this.store) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the positive tail down through the origin
   * and continue to the negative tail.
   *
   * Order:
   *   +N, ..., +2, +1, 0, -1, -2, ..., -M
   *
   * Useful when you want a strictly descending order of Y,
   * spanning the entire butterfly.
   */
  protected *iterateYPositiveToNegative(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iteratePositiveToNegative()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the negative tail up through the origin
   * and continue to the positive tail.
   *
   * Order:
   *   -M, ..., -2, -1, 0, +1, +2, ..., +N
   *
   * Useful when you want a strictly ascending order of Y,
   * spanning the entire butterfly.
   */
  protected *iterateYNegativeToPositive(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iterateNegativeToPositive()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the positive tail down to the neutral origin (y=0).
   *
   * Order:
   *   +N, ..., +2, +1, 0
   *
   * Stops at the origin. Does not continue into negative levels.
   */
  protected *iterateYPositiveToNeutral(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iteratePositiveToNeutral()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the negative tail up to the neutral origin (y=0).
   *
   * Order:
   *   -M, ..., -2, -1, 0
   *
   * Stops at the origin. Does not continue into positive levels.
   */
  protected *iterateYNegativeToNeutral(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iterateNegativeToNeutral()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the neutral origin (y=0) upward to the positive tail.
   *
   * Order:
   *   0, +1, +2, ..., +N
   *
   * Useful when you only care about the neutral and positive levels.
   */
  protected *iterateYNeutralToPositive(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iterateNeutralToPositive()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the neutral origin (y=0) downward to the negative tail.
   *
   * Order:
   *   0, -1, -2, ..., -M
   *
   * Useful when you only care about the neutral and negative levels.
   */
  protected *iterateYNeutralToNegative(): IterableIterator<{
    index: number;
    value: ButterflyLevel<T>;
  }> {
    for (const node of this.store.iterateNeutralToNegative()) {
      yield node;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Collect all positive levels (y > 0) in ascending order.
   *
   * Returns an array of { index, value } pairs.
   */
  protected getAllYPositive(): {
    index: number;
    value: ButterflyLevel<T>;
  }[] {
    return this.store.getAllPositive();
  }

  /**
   * @author ChatGPT5
   *
   * Collect all negative levels (y < 0) in descending order.
   *
   * Returns an array of { index, value } pairs.
   */
  protected getAllYNegative(): {
    index: number;
    value: ButterflyLevel<T>;
  }[] {
    return this.store.getAllNegative();
  }

  /**
   * @author ChatGPT5
   *
   * Reduce across levels (Y-axis) starting at `startY` towards neutral (0),
   * using the store's reduceToNeutral. The reducer receives:
   *   acc  - the accumulator
   *   level - the BipolarLinkedList<Value> at the current Y
   *   y    - the current Y index
   *   self - the Butterfly instance
   *
   * Returns the accumulated result, or `undefined` if `startY` doesn't exist.
   */
  public reduceYToNeutral<Accumulator>(
    startY: number,
    reducer: (
      acc: Accumulator,
      level: ButterflyLevel<T>,
      y: number,
      self: Butterfly<T>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator | undefined {
    // delegate to the store (BipolarLinkedList<BipolarLinkedList<Value>>)
    console.log("reduceYToNeutral call");
    return this.store.reduceToNeutral<Accumulator>(
      startY,
      (acc, level, y) => reducer(acc, level, y, this),
      initialValue,
    );
  }

  /**
   * @author ChatGPT5
   *
   * Reduce within a single level (X-axis) starting at `startX` towards neutral (0).
   * The reducer receives:
   *   acc   - the accumulator
   *   value - the value at current X
   *   x     - the current X index
   *   level - the BipolarLinkedList<Value> for this Y
   *
   * @returns the accumulated result, or `undefined` if the level or startX doesn't exist.
   */
  public reduceXToNeutral<Accumulator>(
    y: number,
    startX: number,
    reducer: (
      acc: Accumulator,
      value: ButterflyCell<T>,
      x: number,
      level: ButterflyLevel<T>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator | undefined {
    const level = this.getLevel(y);
    if (!level) return undefined;

    return level.reduceToNeutral<Accumulator>(
      startX,
      (acc, value, x) => reducer(acc, value, x, level),
      initialValue,
    );
  }

  /**
   * @author Lukas Diegelmann
   *
   * Get the last (rightmost) value of a given level.
   *
   * For the specified Y-level, this returns the value stored at the
   * positive tail of the underlying BipolarLinkedList. This corresponds
   * to the node with the highest X-index currently present in that level.
   *
   * @param y - The Y-coordinate (level index) of the desired row.
   * @returns
   *   - The value of the node at the positive tail of the level,
   *   - or `undefined` if the level does not exist or is empty.
   */
  public getLastCell(y: number): ButterflyCell<T> | undefined {
    const level = this.getLevel(y);

    if (level) {
      return level.peekLast();
    }
  }

  get yDimensions() {
    return {
      positive: this.store.lengthPositive,
      negative: this.store.lengthNegative,
    };
  }

  public getAllPositive() {
    return this.store.getAllPositive();
  }

  public getAllNegative() {
    return this.store.getAllNegative();
  }

  /**
   * @author ChatGPT5
   *
   * Logs all levels of the butterfly stack to the console.
   *
   * Each level is printed in the order of the store's default iterator
   * (0, +1, -1, +2, -2, …). For each level, all values along the X-axis
   * are collected and printed in a single line.
   *
   * Example output:
   *   Butterfly log:
   *   y=0: [a0, a1]
   *   y=1: [b0, b1]
   *   y=-1: [c0]
   */
  public log() {
    // Iterate over all levels (the Y-dimension).
    for (const { y, level } of this.store) {
      const values: (string | undefined)[] = [];

      // Collect values on the positive side (1, 2, …).
      for (const { cell } of level) {
        values.push(JSON.stringify(cell));
      }

      // Print the row for this level
      console.log(`y=${y}: [${values.join(", ")}]`);
    }
  }

  /**
   * @author ChatGPT5
   *
   * Move a numeric index one step closer to zero (toward the neutral origin).
   *
   * Examples:
   *   5   → 4
   *   1   → 0
   *  -3   → -2
   *  -1   → 0
   *   0   → 0
   *
   * This delegates to the underlying BipolarLinkedList helper.
   *
   * @param index - The index to adjust.
   * @returns The index moved one step closer to zero.
   */
  public stepTowardZero(index: number): number {
    return this.store.stepTowardZero(index);
  }
}
