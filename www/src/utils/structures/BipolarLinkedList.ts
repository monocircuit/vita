export enum BipolarLinkedListPolartity {
  POSITIVE,
  NEUTRAL,
  NEGATIVE,
}

class BipolarLinkedListNode<Value> {
  /** Coordinate Information */
  public index: number;

  /** Content Information */
  public value: Value;

  /** Links to the other Nodes */
  public next: BipolarLinkedListNode<Value> | undefined;
  public prev: BipolarLinkedListNode<Value> | undefined;

  constructor(index: number, value: Value) {
    this.index = index;
    this.value = value;
  }
}

export default class BipolarLinkedList<Value> {
  /** Meta Information */
  private _origin: BipolarLinkedListNode<Value> | undefined;
  private _negativeTail: BipolarLinkedListNode<Value> | undefined;
  private _positiveTail: BipolarLinkedListNode<Value> | undefined;

  private _length: number;
  private _lengthPositive: number;
  private _lengthNegative: number;

  constructor() {
    this._length = 0;
    this._lengthPositive = 0;
    this._lengthNegative = 0;
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
  public get(index: number): Value | undefined {
    return this.findNode(index)?.value;
  }

  /**
   * @author Lukas Diegelmann, ChatGPT5
   *
   * Sets the value at position x
   */
  public set(index: number, value: Value): boolean {
    const temp = this.findNode(index);

    /** In case the node already exists */
    if (temp) {
      temp.value = value;
      return true;
    }

    /** In case the user wants to set the origin */
    if (index == 0) {
      this._origin = new BipolarLinkedListNode(index, value);

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
      const newNode = new BipolarLinkedListNode(index, value);

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
      const newNode = new BipolarLinkedListNode(index, value);

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
  private findNode(index: number): BipolarLinkedListNode<Value> | undefined {
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
   */
  *[Symbol.iterator](): IterableIterator<{ index: number; value: Value }> {
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
        let node: BipolarLinkedListNode<Value> | undefined = this._origin;
        // Move right until we reach or surpass the target index.
        while (node && node.index < step) node = node.next;
        if (node && node.index === step) {
          yield { index: node.index, value: node.value };
          hasYielded = true;
        }
      }

      // --- Negative side: try to yield the node at -step ---
      if (this._negativeTail && this._negativeTail.index <= -step) {
        let node: BipolarLinkedListNode<Value> | undefined = this._origin;
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
    value: Value;
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
    value: Value;
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
    value: Value;
  }> {
    if (!this._origin) return;
    let node: BipolarLinkedListNode<Value> | undefined = this._origin;
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
    value: Value;
  }> {
    if (!this._origin) return;
    let node: BipolarLinkedListNode<Value> | undefined = this._origin;
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
    value: Value;
  }> {
    // Choose the best starting point:
    // - Prefer the positive tail if it exists,
    // - else start at origin if it exists,
    // - else (only negative side exists) start at the negative tail.
    let node: BipolarLinkedListNode<Value> | undefined =
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
    value: Value;
  }> {
    // Choose the best starting point:
    // - Prefer the negative tail if it exists,
    // - else start at origin if it exists,
    // - else (only positive side exists) start at the positive tail.
    let node: BipolarLinkedListNode<Value> | undefined =
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
  public getAllPositive(): { index: number; value: Value }[] {
    const result: { index: number; value: Value }[] = [];
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
  public getAllNegative(): { index: number; value: Value }[] {
    const result: { index: number; value: Value }[] = [];
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
      value: Value,
      index: number,
      list: BipolarLinkedList<Value>,
    ) => void,
  ): void {
    for (const { index, value } of this) {
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
    mapper: (value: Value, index: number, list: BipolarLinkedList<Value>) => U,
  ): BipolarLinkedList<U> {
    const result = new BipolarLinkedList<U>();
    for (const { index, value } of this) {
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
      value: Value,
      index: number,
      list: BipolarLinkedList<Value>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator {
    let acc = initialValue;
    for (const { index, value } of this) {
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
      value: Value,
      index: number,
      list: BipolarLinkedList<Value>,
    ) => Accumulator,
    initialValue: Accumulator,
  ): Accumulator | undefined {
    const startNode = this.findNode(startIndex);
    if (!startNode) return undefined;

    let acc = initialValue;
    let node: BipolarLinkedListNode<Value> | undefined = startNode;

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
}
