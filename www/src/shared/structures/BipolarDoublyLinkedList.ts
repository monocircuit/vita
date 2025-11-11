export enum BipolarLinkedListPolartity {
  POSITIVE,
  NEUTRAL,
  NEGATIVE,
}

interface BipolarDoublyLinkedListOptions<T, Y> {
  project: (entry: { index: number; value: T }) => Y;
}

class BipolarDoublyLinkedListNode<Value> {
  /** Coordinate Information */
  public index: number;

  /** Content Information */
  public value: Value;

  /** Links to the other Nodes */
  public next: BipolarDoublyLinkedListNode<Value> | undefined;
  public prev: BipolarDoublyLinkedListNode<Value> | undefined;

  constructor(index: number, value: Value) {
    this.index = index;
    this.value = value;
  }
}

export default class BipolarDoublyLinkedList<T, Y = { index: number; value: T }>
  implements Iterable<Y>
{
  /** Meta Information */
  private _origin: BipolarDoublyLinkedListNode<T> | undefined;
  private _negativeTail: BipolarDoublyLinkedListNode<T> | undefined;
  private _positiveTail: BipolarDoublyLinkedListNode<T> | undefined;

  private _length: number;
  private _lengthPositive: number;
  private _lengthNegative: number;

  constructor(options?: BipolarDoublyLinkedListOptions<T, Y>) {
    this._length = 0;
    this._lengthPositive = 0;
    this._lengthNegative = 0;

    if (options?.project) this.project = options.project;
  }

  /**
   * Customize the yield shape of the default iterator.
   * By default, the iterator yields `{ index, value }`.
   * Subclasses can override this to project entries to a different form.
   */
  protected project(entry: { index: number; value: T }): Y {
    return entry as unknown as Y;
  }

  /**
   * @author ChatGPT5
   *
   * Total number of nodes in the list.
   *
   * This includes:
   *   - the neutral origin node (index = 0), if it exists,
   *   - all nodes on the positive side (index > 0),
   *   - all nodes on the negative side (index < 0).
   */
  get length() {
    return this._length;
  }

  /**
   * @author ChatGPT5
   *
   * Number of nodes on the positive side of the list.
   *
   * These are nodes with index > 0, counted independently of the
   * origin (index = 0). The value grows as new nodes are appended
   * to the positive end.
   */
  get lengthPositive() {
    return this._lengthPositive;
  }

  /**
   * @author ChatGPT5
   *
   * Number of nodes on the negative side of the list.
   *
   * These are nodes with index < 0, counted independently of the
   * origin (index = 0). The value grows as new nodes are appended
   * to the negative end.
   */
  get lengthNegative() {
    return this._lengthNegative;
  }

  get origin() {
    return this._origin;
  }

  get positiveTail() {
    return this._positiveTail;
  }

  get negativeTail() {
    return this._negativeTail;
  }

  /** Gets the value at position x, if it exists */
  public get(index: number): T | undefined {
    return this.findNode(index)?.value;
  }

  /**
   * @author Lukas Diegelmann, ChatGPT5
   *
   * Sets the value at position x
   */
  public set(index: number, value: T): boolean {
    const temp = this.findNode(index);

    /** In case the node already exists */
    if (temp) {
      temp.value = value;
      return true;
    }

    /** In case the user wants to set the origin */
    if (index == 0) {
      this._origin = new BipolarDoublyLinkedListNode(index, value);

      /** The pointers should then point to undefined */
      this._origin.next = undefined;
      this._origin.prev = undefined;

      /** The positive and negative tail should be both `origin` */
      this._positiveTail = this._origin;
      this._negativeTail = this._origin;

      /** Update length property */
      this._length++;

      /** Return status of operation */
      return true;
    }

    /** In case the node does not yet exist */
    /** In case the x value is positive it needs to be 
        put at the positive end */
    if (this._positiveTail && index === this._positiveTail.index + 1) {
      const newNode = new BipolarDoublyLinkedListNode(index, value);

      /** Bending pointers to fit the new node into the list */
      this._positiveTail.next = newNode;
      newNode.prev = this._positiveTail;
      this._positiveTail = newNode;

      /** Update length property */
      this._length++;
      this._lengthPositive++;

      /** Return status of operation */
      return true;
    }

    /** In caase the x value is negative it must be 
        put at the negative end */
    if (this._negativeTail && index === this._negativeTail.index - 1) {
      const newNode = new BipolarDoublyLinkedListNode(index, value);

      /** Bending the pointers to fit the new node into the list */
      this._negativeTail.prev = newNode;
      newNode.next = this._negativeTail;
      this._negativeTail = newNode;

      /** Update length property */
      this._length++;
      this._lengthNegative++;

      /** Return status of operation */
      return true;
    }

    /** In case something went wrong the false status is returned */
    return false;
  }

  /**
   * Helper function that is able to find a node with given index
   */
  private findNode(index: number): BipolarDoublyLinkedListNode<T> | undefined {
    if (index === 0) {
      return this._origin;
    }

    if (index > 0 && this._positiveTail && index <= this._positiveTail.index) {
      let temp = this._origin;
      while (temp && temp.index !== index) {
        temp = temp.next;
      }
      return temp;
    }

    if (index < 0 && this._negativeTail && this._negativeTail.index) {
      let temp = this._origin;
      while (temp && temp.index !== index) {
        temp = temp.prev;
      }
      return temp;
    }

    return undefined;
  }

  /**
   * Default iterator for the BipolarLinkedList.
   *
   * Iterates over the list in the order:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * That means it starts from the origin node (index = 0),
   * then alternates between the positive side and the negative side,
   * moving one step further out on each iteration.
   *
   * NOTE: The yielded value is customizable via `project({ index, value })`.
   * By default, it yields `{ index, value }`.
   */
  *[Symbol.iterator](): IterableIterator<Y> {
    for (const entry of this.entries()) {
      yield this.project(entry);
    }
  }

  /**
   * Stable entries iterator that always yields `{ index, value }`
   * in the same alternating order as the default iterator:
   *   0, +1, -1, +2, -2, +3, -3, ...
   * Use this when you specifically need `{ index, value }` regardless of
   * any customization to the default iterator yield type.
   */
  public *entries(): IterableIterator<{ index: number; value: T }> {
    // If there is no origin node, the list is empty → nothing to iterate.
    if (!this._origin) {
      return;
    }

    // Always yield the origin (index 0) first.
    yield { index: this._origin.index, value: this._origin.value };

    let step = 1;
    while (true) {
      let hasYielded = false;

      // --- Positive side: try to yield the node at +step ---
      if (this._positiveTail && this._positiveTail.index >= step) {
        let node: BipolarDoublyLinkedListNode<T> | undefined = this._origin;
        // Move right until we reach or surpass the target index.
        while (node && node.index < step) node = node.next;
        if (node && node.index === step) {
          yield { index: node.index, value: node.value };
          hasYielded = true;
        }
      }

      // --- Negative side: try to yield the node at -step ---
      if (this._negativeTail && this._negativeTail.index <= -step) {
        let node: BipolarDoublyLinkedListNode<T> | undefined = this._origin;
        // Move left until we reach or surpass the target index.
        while (node && node.index > -step) node = node.prev;
        if (node && node.index === -step) {
          yield { index: node.index, value: node.value };
          hasYielded = true;
        }
      }

      // If neither side produced a node at this step,
      // then the iteration is finished.
      if (!hasYielded) break;

      step++;
    }
  }

  /**
   * Iterate from the positive tail down to the neutral origin (index 0).
   * Yields nodes in decreasing order of their index.
   */
  *iteratePositiveToNeutral(): IterableIterator<{
    index: number;
    value: T;
  }> {
    let node = this._positiveTail;
    while (node) {
      yield { index: node.index, value: node.value };
      if (node.index === 0) break; // reached origin
      node = node.prev;
    }
  }

  /**
   * Iterate from the negative tail up to the neutral origin (index 0).
   * Yields nodes in increasing order of their index.
   */
  *iterateNegativeToNeutral(): IterableIterator<{
    index: number;
    value: T;
  }> {
    let node = this._negativeTail;
    while (node) {
      yield { index: node.index, value: node.value };
      if (node.index === 0) break; // reached origin
      node = node.next;
    }
  }

  /**
   * Iterate from neutral origin (0) up to the positive tail.
   * Yields nodes in increasing order of their index.
   */
  *iterateNeutralToPositive(): IterableIterator<{
    index: number;
    value: T;
  }> {
    if (!this._origin) return;
    let node: BipolarDoublyLinkedListNode<T> | undefined = this._origin;
    while (node) {
      yield { index: node.index, value: node.value };
      node = node.next;
    }
  }

  /**
   * Iterate from neutral origin (0) down to the negative tail.
   * Yields nodes in decreasing order of their index.
   */
  *iterateNeutralToNegative(): IterableIterator<{
    index: number;
    value: T;
  }> {
    if (!this._origin) return;
    let node: BipolarDoublyLinkedListNode<T> | undefined = this._origin;
    while (node) {
      yield { index: node.index, value: node.value };
      node = node.prev;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the positive tail all the way down to the negative tail,
   * passing through the neutral origin (index 0) if present.
   * Yields nodes in strictly decreasing index order:
   *   +N, ..., +2, +1, 0, -1, -2, ..., -M
   */
  *iteratePositiveToNegative(): IterableIterator<{
    index: number;
    value: T;
  }> {
    // Choose the best starting point:
    // - Prefer the positive tail if it exists,
    // - else start at origin if it exists,
    // - else (only negative side exists) start at the negative tail.
    let node: BipolarDoublyLinkedListNode<T> | undefined =
      this._positiveTail ?? this._origin ?? this._negativeTail;

    while (node) {
      yield { index: node.index, value: node.value };
      node = node.prev; // walk left through origin and into the negative side
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterate from the negative tail all the way up to the positive tail,
   * passing through the neutral origin (index 0) if present.
   * Yields nodes in strictly increasing index order:
   *   -M, ..., -2, -1, 0, +1, +2, ..., +N
   */
  *iterateNegativeToPositive(): IterableIterator<{
    index: number;
    value: T;
  }> {
    // Choose the best starting point:
    // - Prefer the negative tail if it exists,
    // - else start at origin if it exists,
    // - else (only positive side exists) start at the positive tail.
    let node: BipolarDoublyLinkedListNode<T> | undefined =
      this._negativeTail ?? this._origin ?? this._positiveTail;

    while (node) {
      yield { index: node.index, value: node.value };
      node = node.next; // walk right through origin and into the positive side
    }
  }

  /**
   * Collect all nodes on the positive side (index > 0).
   * Returns them in ascending order of index (1, 2, 3, …).
   */
  public getAllPositive(): { index: number; value: T }[] {
    const result: { index: number; value: T }[] = [];
    if (!this._origin) return result;

    let node = this._origin.next;
    while (node) {
      if (node.index > 0) {
        result.push({ index: node.index, value: node.value });
      }
      node = node.next;
    }
    return result;
  }

  /**
   * Collect all nodes on the negative side (index < 0).
   * Returns them in descending order of index (… -3, -2, -1).
   */
  public getAllNegative(): { index: number; value: T }[] {
    const result: { index: number; value: T }[] = [];
    if (!this._origin) return result;

    let node = this._origin.prev;
    while (node) {
      if (node.index < 0) {
        result.push({ index: node.index, value: node.value });
      }
      node = node.prev;
    }
    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Execute a callback function once for each node in the list.
   * Iteration order is the same as the default iterator:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * @param callback - A function to execute for each element,
   *   receiving the node's value, index, and the list itself.
   */
  public forEach(
    callback: (
      value: T,
      index: number,
      list: BipolarDoublyLinkedList<T, Y>,
    ) => void,
  ): void {
    for (const { index, value } of this.entries()) {
      callback(value, index, this);
    }
  }

  /**
   * @author ChatGPT5
   *
   * Create a new BipolarLinkedList by applying a mapping function
   * to each value in the current list.
   *
   * Iteration order is the same as the default iterator:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * @param mapper - Function that receives the current value,
   *   its index, and the list itself, and returns the mapped value.
   * @returns A new BipolarLinkedList<U> with the same structure
   *   and indices, but containing the mapped values.
   */
  public map<U>(
    mapper: (value: T, index: number, list: BipolarDoublyLinkedList<T, Y>) => U,
  ): BipolarDoublyLinkedList<U> {
    const result = new BipolarDoublyLinkedList<U>();
    for (const { index, value } of this.entries()) {
      result.set(index, mapper(value, index, this));
    }
    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Create a new BipolarLinkedList by applying a mapping function
   * only to the neutral (0) and positive side (x >= 0).
   *
   * Order of iteration:
   *   0, +1, +2, ..., +N
   *
   * Negative side (x < 0) is ignored and not copied into the new list.
   *
   * @param mapper - Function that receives the current value,
   *   its index, and the list itself, and returns the mapped value.
   * @returns A new BipolarLinkedList<U> containing only the neutral
   *   and positive values, transformed by the mapper function.
   */
  public mapNeutralToPositive<U>(
    mapper: (value: T, index: number, list: BipolarDoublyLinkedList<T, Y>) => U,
  ): BipolarDoublyLinkedList<U> {
    const result = new BipolarDoublyLinkedList<U>();

    for (const { index, value } of this.iterateNeutralToPositive()) {
      result.set(index, mapper(value, index, this));
    }

    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Create a new BipolarLinkedList by applying a mapping function
   * only to the neutral (0) and negative side (x <= 0).
   *
   * Order of iteration:
   *   0, -1, -2, ..., -M
   *
   * Positive side (x > 0) is ignored and not copied into the new list.
   *
   * @param mapper - Function that receives the current value,
   *   its index, and the list itself, and returns the mapped value.
   * @returns A new BipolarLinkedList<U> containing only the neutral
   *   and negative values, transformed by the mapper function.
   */
  public mapNeutralToNegative<U>(
    mapper: (value: T, index: number, list: BipolarDoublyLinkedList<T, Y>) => U,
  ): BipolarDoublyLinkedList<U> {
    const result = new BipolarDoublyLinkedList<U>();

    for (const { index, value } of this.iterateNeutralToNegative()) {
      result.set(index, mapper(value, index, this));
    }

    return result;
  }

  /**
   * @author ChaptGPT5
   *
   * Apply a reducer function on every node in the list and return a single result.
   * Iteration order is the same as the default iterator:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * @param reducer - A function that receives the accumulator, the current value,
   *   the current index, and the list itself. It should return the updated accumulator.
   * @param initialValue - The initial value to start accumulating with.
   * @returns The final accumulated result.
   */
  public reduce<Accumulator>(
    reducer: (
      acc: Accumulator,
      value: T,
      index: number,
      list: BipolarDoublyLinkedList<T, Y>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator {
    let acc = initialValue;
    for (const { index, value } of this.entries()) {
      acc = reducer(acc, value, index, this);
    }
    return acc;
  }

  /**
   * @author ChatGPT5
   *
   * Reduce starting from a given index down (or up) to the neutral origin (0).
   * The reducer will be called for each visited node, including the start node
   * and the origin.
   *
   * Example:
   *   list.reduceToNeutral(3, (acc, val) => acc + val, 0);
   *
   * @param startIndex - The index to start from (must exist).
   * @param reducer - Function called with accumulator, node value, node index, and the list.
   * @param initialValue - Initial accumulator value.
   * @returns The accumulated result, or undefined if startIndex not found.
   */
  public reduceToNeutral<Accumulator>(
    startIndex: number,
    reducer: (
      acc: Accumulator,
      value: T,
      index: number,
      list: BipolarDoublyLinkedList<T, Y>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator | undefined {
    const startNode = this.findNode(startIndex);
    if (!startNode) return undefined;

    let acc = initialValue;
    let node: BipolarDoublyLinkedListNode<T> | undefined = startNode;

    if (startIndex > 0) {
      // move backwards (towards 0) via prev
      while (node) {
        acc = reducer(acc, node.value, node.index, this);
        if (node.index === 0) break;
        node = node.prev;
      }
    } else if (startIndex < 0) {
      // move forwards (towards 0) via next
      while (node) {
        acc = reducer(acc, node.value, node.index, this);
        if (node.index === 0) break;
        node = node.next;
      }
    } else {
      // already at origin
      acc = reducer(acc, node.value, node.index, this);
    }

    return acc;
  }

  /**
   * @author ChatGPT5
   *
   * Convert the list into a plain array using the default iterator.
   *
   * Order:
   *   0, +1, -1, +2, -2, +3, -3, ...
   *
   * @returns An array of all values in default alternating order.
   */
  public toArray(): T[] {
    const result: T[] = [];
    for (const { value } of this.entries()) {
      result.push(value);
    }
    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Convert the list into a plain array using the neutral-to-positive order.
   *
   * Order:
   *   0, +1, +2, ..., +N
   *
   * @returns An array of all values from origin to positive tail.
   */
  public toArrayNeutralToPositive(): T[] {
    const result: T[] = [];
    for (const { value } of this.iterateNeutralToPositive()) {
      result.push(value);
    }
    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Convert the list into a plain array using the neutral-to-negative order.
   *
   * Order:
   *   0, -1, -2, ..., -M
   *
   * @returns An array of all values from origin to negative tail.
   */
  public toArrayNeutralToNegative(): T[] {
    const result: T[] = [];
    for (const { value } of this.iterateNeutralToNegative()) {
      result.push(value);
    }
    return result;
  }

  /**
   * @author ChatGPT5
   *
   * Move a numeric index one step closer to zero.
   *
   * Examples:
   *   - If index = 5   → returns 4
   *   - If index = 1   → returns 0
   *   - If index = -3  → returns -2
   *   - If index = -1  → returns 0
   *   - If index = 0   → returns 0
   *
   * @param index - The index to adjust.
   * @returns The given index moved one step toward 0.
   */
  public stepTowardZero(index: number): number {
    if (index > 0) return index - 1;
    if (index < 0) return index + 1;
    return 0; // already at zero
  }
}
