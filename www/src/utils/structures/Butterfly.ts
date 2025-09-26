import BipolarLinkedList from "./BipolarLinkedList";

export interface ButterflyVector<Value> extends ButterflyDepth {
  value: Value;
}

export interface ButterflyDepth {
  x: number;
  y: number;
}

export default class Butterfly<Value> {
  private store: BipolarLinkedList<BipolarLinkedList<Value>>;

  constructor() {
    this.store = new BipolarLinkedList();
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
  public getLastVectors() {
    const vectors: ButterflyVector<Value>[] = [];

    /** Alternating between positive and negative levels and 
        pushing vectors in (starting with the neutral level) */
    for (const node of this.store) {
      vectors.push({
        value: this.getLast(node.index) as any,
        x: (this.getLevel(node.index)?.length as number) - 1,
        y: node.index,
      });
    }

    return vectors;
  }

  public getLastVector(y: number): ButterflyVector<Value> | undefined {
    const level = this.getLevel(y);

    if (level) {
      const value = this.getLast(y);

      if (value) {
        return {
          value,
          x: level.length - 1,
          y,
        };
      }
    }
  }

  public getLevel(y: number): BipolarLinkedList<Value> | undefined {
    return this.store.get(y);
  }

  public doesLevelExist(y: number) {
    return !!this.store.get(y);
  }

  public get(y: number, x: number): Value | undefined {
    const level = this.getLevel(y);

    if (level) {
      return level.get(x);
    }
  }

  public set(y: number, x: number, value: Value): boolean {
    /** Check if level already exists */
    const level = this.getLevel(y);

    if (level) {
      /** If the level already exists, the algorithm can just set the value at x */
      return level.set(x, value);
    }

    /** Should the level not already exists */
    const hasSucceeded = this.store.set(y, new BipolarLinkedList());
    const newLevel = this.store.get(y);

    if (hasSucceeded && newLevel) {
      /** If the operation to create the new level has succeeded, the algorith
            can now add the value at the desired `x` spot */
      return newLevel.set(x, value);
    }

    return false;
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
  public push(y: number, value: Value): boolean {
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
    index: number;
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
    value: BipolarLinkedList<Value>;
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
      level: BipolarLinkedList<Value>,
      y: number,
      self: Butterfly<Value>,
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
      value: Value,
      x: number,
      level: BipolarLinkedList<Value>,
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
  public getLast(y: number): Value | undefined {
    const level = this.getLevel(y);

    if (level) {
      return level.positiveTail?.value;
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
    for (const levelNode of this.store) {
      const level = levelNode.value;
      const y = levelNode.index;

      const values: (string | undefined)[] = [];

      // Collect values on the negative side (… -2, -1, 0).
      // We build this in reverse so the order is correct from left to right.
      for (const node of level.iterateNeutralToNegative()) {
        values.unshift(JSON.stringify(node.value));
      }

      // Collect values on the positive side (1, 2, …).
      // Skip 0 here because it's already included in the negative iteration.
      for (const node of level.iterateNeutralToPositive()) {
        if (node.index !== 0) values.push(JSON.stringify(node.value));
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
