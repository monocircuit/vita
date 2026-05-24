/**
 * @author ChatGPT5
 *
 * Represents a single node in a {@link DoublyLinkedList}.
 *
 * Each node stores a value of type `T` and maintains bidirectional
 * references to its neighboring nodes:
 * - `next` points to the following node, or `null` if this is the tail.
 * - `prev` points to the preceding node, or `null` if this is the head.
 *
 * This class is internal to the implementation and is typically
 * not used directly by consumers of the list.
 *
 * @typeParam T The type of the value stored in the node.
 */
class DoublyLinkedListNode<T> {
  /**
   * @author ChatGPT5
   *
   * Internal node used by DoublyLinkedList to store a value and its
   * bidirectional links to neighboring nodes.
   *
   * @internal
   */
  value: T;

  /**
   * @author ChatGPT5
   *
   * Link to the next node in the list, or `null` if this is the tail.
   *
   * @internal
   */
  next: DoublyLinkedListNode<T> | null = null;

  /**
   * @author ChatGPT5
   *
   * Link to the previous node in the list, or `null` if this is the head.
   *
   * @internal
   */
  prev: DoublyLinkedListNode<T> | null = null;

  /**
   * @author ChatGPT5
   *
   * Constructs a new node with the given value. Links are initialized to `null`.
   *
   * @param value The value to store in the node.
   */
  constructor(value: T) {
    this.value = value;
  }
}

/**
 * @author ChatGPT5
 *
 * A classic, mutable, indexable **doubly linked list**.
 *
 * Characteristics:
 * - End operations are **O(1)**: `push`, `pop`, `unshift`, `shift`.
 * - Indexed access and edits are **O(n)**: `get`, `set`, `insert`, `removeAt`.
 * - Iteration traverses from head to tail by default.
 *
 * Naming alignment:
 * - Provides `iterateNeutralToPositive()` (head → tail) and
 *   `iteratePositiveToNeutral()` (tail → head) to mirror a bipolar list’s
 *   iterator naming scheme.
 */
export class DoublyLinkedList<T, Y = { index: number; value: T }>
  implements Iterable<Y>
{
  /**
   * @author ChatGPT5
   *
   * Reference to the first node of the list, or `null` if empty.
   *
   * @internal
   */
  private head: DoublyLinkedListNode<T> | null = null;

  /**
   * @author ChatGPT5
   *
   * Reference to the last node of the list, or `null` if empty.
   *
   * @internal
   */
  private tail: DoublyLinkedListNode<T> | null = null;

  /**
   * @author ChatGPT5
   *
   * Cached count of elements in the list.
   *
   * @internal
   */
  private _length = 0;

  /**
   * @author ChatGPT5
   *
   * Returns the total number of elements currently stored in the list.
   */
  get length(): number {
    return this._length;
  }

  /**
   * @author ChatGPT5
   *
   * Indicates whether the list contains no elements.
   *
   * @returns `true` if the list is empty; otherwise `false`.
   */
  get isEmpty(): boolean {
    return this._length === 0;
  }

  /**
   * @author ChatGPT5
   *
   * Returns the first element (at the head) without removing it.
   *
   * @returns The first element, or `undefined` if the list is empty.
   */
  public peekFirst(): T | undefined {
    return this.head?.value;
  }

  /**
   * @author ChatGPT5
   *
   * Returns the last element (at the tail) without removing it.
   *
   * @returns The last element, or `undefined` if the list is empty.
   */
  public peekLast(): T | undefined {
    return this.tail?.value;
  }

  /**
   * @author ChatGPT5
   *
   * Appends a value at the tail of the list.
   * Runs in O(1).
   *
   * @param value The value to append.
   */
  public push(value: T): T {
    const n = new DoublyLinkedListNode(value);
    if (!this.tail) {
      this.head = this.tail = n;
    } else {
      n.prev = this.tail;
      this.tail.next = n;
      this.tail = n;
    }
    this._length++;

    return n.value;
  }

  /**
   * @author ChatGPT5
   *
   * Removes and returns the last element (tail) of the list.
   * Runs in O(1).
   *
   * @returns The removed value, or `undefined` if the list is empty.
   */
  public pop(): T | undefined {
    if (!this.tail) return undefined;
    const v = this.tail.value;
    const p = this.tail.prev;
    if (p) {
      p.next = null;
    } else {
      this.head = null;
    }
    this.tail = p;
    this._length--;
    return v;
  }

  /**
   * @author ChatGPT5
   *
   * Prepends a value at the head of the list.
   * Runs in O(1).
   *
   * @param value The value to prepend.
   */
  public unshift(value: T): void {
    const n = new DoublyLinkedListNode(value);
    if (!this.head) {
      this.head = this.tail = n;
    } else {
      n.next = this.head;
      this.head.prev = n;
      this.head = n;
    }
    this._length++;
  }

  /**
   * @author ChatGPT5
   *
   * Removes and returns the first element (head) of the list.
   * Runs in O(1).
   *
   * @returns The removed value, or `undefined` if the list is empty.
   */
  public shift(): T | undefined {
    if (!this.head) return undefined;
    const v = this.head.value;
    const nx = this.head.next;
    if (nx) {
      nx.prev = null;
    } else {
      this.tail = null;
    }
    this.head = nx;
    this._length--;
    return v;
  }

  /**
   * @author ChatGPT5
   *
   * Retrieves the node at a 0-based index. Chooses the shorter path
   * (from head or tail) to minimize traversal cost. Returns `null`
   * if the index is out of range.
   *
   * Runs in O(n).
   *
   * @param index The 0-based position.
   * @returns The node at the given index, or `null` if out of range.
   *
   * @internal
   */
  private getNode(index: number): DoublyLinkedListNode<T> | null {
    if (index < 0 || index >= this._length) return null;
    if (index <= this._length / 2) {
      let n = this.head;
      for (let i = 0; i < index; i++) n = n!.next;
      return n!;
    } else {
      let n = this.tail;
      for (let i = this._length - 1; i > index; i--) n = n!.prev;
      return n!;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Returns the value at a 0-based index.
   *
   * Runs in O(n).
   *
   * @param index The 0-based position.
   * @returns The value at the index, or `undefined` if out of range.
   */
  public get(index: number): T | undefined {
    return this.getNode(index)?.value;
  }

  /**
   * @author ChatGPT5
   *
   * Replaces the value at a 0-based index. If index equals the current length,
   * appends a new node. Indices greater than length or negative are rejected
   * (no gaps allowed).
   *
   * Runs in O(n) for overwrite; O(1) for append.
   *
   * @param index The 0-based position to set.
   * @param value The value to store.
   * @returns `true` if overwritten or appended; `false` if out of range.
   */
  public set(index: number, value: T): null | T {
    // kein negatives Setzen, kein Überspringen von Indizes
    if (index < 0 || index > this._length) return null;

    // exakt am Ende? -> wie push, keine Lücke
    if (index === this._length) {
      return this.push(value);
    }

    // existierendes Node holen und überschreiben
    const n = this.getNode(index);
    if (!n) return null; // sollte wegen Bounds nicht vorkommen
    n.value = value;
    return n.value;
  }

  /**
   * @author ChatGPT5
   *
   * Inserts a value **before** the element at `index`.
   * - If `index === 0`, behaves like `unshift`.
   * - If `index === length`, behaves like `push`.
   *
   * Runs in O(n).
   *
   * @param index The insertion position (0..length).
   * @param value The value to insert.
   * @returns `true` on success; `false` if `index` is out of range.
   */
  public insert(index: number, value: T): boolean {
    if (index < 0 || index > this._length) return false;
    if (index === 0) {
      this.unshift(value);
      return true;
    }
    if (index === this._length) {
      this.push(value);
      return true;
    }

    const ref = this.getNode(index);
    if (!ref) return false;

    const n = new DoublyLinkedListNode(value);
    n.prev = ref.prev;
    n.next = ref;
    ref.prev!.next = n;
    ref.prev = n;

    this._length++;
    return true;
  }

  /**
   * @author ChatGPT5
   *
   * Removes the element at `index` and returns its value.
   *
   * Runs in O(n).
   *
   * @param index The 0-based position to remove.
   * @returns The removed value, or `undefined` if out of range.
   */
  public removeAt(index: number): T | undefined {
    const n = this.getNode(index);
    if (!n) return undefined;

    if (n.prev) n.prev.next = n.next;
    else this.head = n.next;

    if (n.next) n.next.prev = n.prev;
    else this.tail = n.prev;

    n.next = n.prev = null;
    this._length--;
    return n.value;
  }

  /**
   * @author ChatGPT5
   *
   * Removes the **first** element for which the predicate returns `true`
   * and returns its value. If nothing matches, returns `undefined`.
   *
   * Runs in O(n).
   *
   * @param pred Predicate tested as `(value, index) => boolean`.
   * @returns The removed value, or `undefined` if no element matched.
   */
  public removeFirstWhere(
    pred: (value: T, index: number) => boolean,
  ): T | undefined {
    let i = 0;
    for (let n = this.head; n; n = n.next, i++) {
      if (pred(n.value, i)) {
        if (n.prev) n.prev.next = n.next;
        else this.head = n.next;

        if (n.next) n.next.prev = n.prev;
        else this.tail = n.prev;

        n.next = n.prev = null;
        this._length--;
        return n.value;
      }
    }
    return undefined;
  }

  /**
   * @author ChatGPT5
   *
   * Removes all elements from the list and severs internal links to
   * help the garbage collector reclaim memory.
   *
   * Runs in O(n).
   */
  public clear(): void {
    for (let n = this.head; n; ) {
      const next = n.next;
      n.next = n.prev = null;
      n = next!;
    }
    this.head = this.tail = null;
    this._length = 0;
  }

  // --- hook to shape the iterator's yield ---
  protected project(value: T, index: number): Y {
    // default: yield the raw value
    return value as unknown as Y;
  }

  /**
   * @author ChatGPT5
   *
   * Default iterator over entries from head → tail.
   *
   * The exact shape of each yielded element depends on the `project` method:
   * - By default, it simply returns the raw stored value.
   * - Subclasses can override `project` to yield `{ i, value }`, `{ x, cell }`,
   *   or any other object structure based on `(value, index)`.
   *
   * @returns An iterator yielding projected elements of type `Y`.
   */
  [Symbol.iterator](): IterableIterator<Y> {
    let n = this.head;
    let i = 0;

    const self = this;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<Y> {
        if (!n) return { done: true, value: undefined as any };
        const out = self.project(n.value, i);
        n = n.next;
        i++;
        return { done: false, value: out };
      },
    };
  }

  /**
   * @author ChatGPT5
   *
   * Iterates from head to tail, yielding `{ index, value }` pairs.
   * Naming mirrors a bipolar list’s `iterateNeutralToPositive`.
   *
   * @returns An iterator over `{ index, value }` items in forward order.
   */
  *iterateNeutralToPositive(): IterableIterator<{ index: number; value: T }> {
    let n = this.head,
      i = 0;
    while (n) {
      yield { index: i++, value: n.value };
      n = n.next;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Iterates from tail to head, yielding `{ index, value }` pairs.
   * Naming mirrors a bipolar list’s `iteratePositiveToNeutral`.
   *
   * @returns An iterator over `{ index, value }` items in reverse order.
   */
  *iteratePositiveToNeutral(): IterableIterator<{ index: number; value: T }> {
    let n = this.tail,
      i = this._length - 1;
    while (n) {
      yield { index: i--, value: n.value };
      n = n.prev;
    }
  }

  /**
   * @author ChatGPT5
   *
   * Converts the list to an array using the **default** order
   * (head → tail).
   *
   * @returns A new array containing all raw values in forward order.
   */
  public toArray(): T[] {
    const out: T[] = [];
    let node = this.head;
    while (node) {
      out.push(node.value);
      node = node.next;
    }
    return out;
  }

  /**
   * @author ChatGPT5
   *
   * Executes a callback function once for each element in the list,
   * iterating from head (index 0) to tail (index `length - 1`).
   *
   * This method does not return a value.
   *
   * @param fn The function to execute for each element. Receives
   *           `(value, index, list)`.
   */
  public forEach(
    fn: (value: T, index: number, list: DoublyLinkedList<T, Y>) => void,
  ): void {
    let i = 0;
    for (let n = this.head; n; n = n.next) fn(n.value, i++, this);
  }

  /**
   * @author ChatGPT5
   *
   * Maps each element to a new value and returns a **new** DoublyLinkedList
   * containing the mapped values in the same order (head → tail).
   *
   * @param fn Mapping function applied to each element. Receives
   *           `(value, index, list)` and returns the mapped value.
   * @returns A new list with the mapped values.
   */
  public map<U>(
    fn: (value: T, index: number, list: DoublyLinkedList<T, Y>) => U,
  ): DoublyLinkedList<U> {
    const out = new DoublyLinkedList<U>(); // i.e., DoublyLinkedList<U, U>
    let i = 0;
    for (let n = this.head; n; n = n.next) {
      out.push(fn(n.value, i++, this));
    }
    return out;
  }

  /**
   * @author ChatGPT5
   *
   * Reduces the list (head → tail) to a single accumulated value.
   *
   * @param reducer The reducer function. Receives
   *                `(accumulator, value, index, list)` and returns
   *                the updated accumulator.
   * @param initial The initial accumulator value.
   * @returns The final accumulated result.
   */
  public reduce<A>(
    reducer: (
      acc: A,
      value: T,
      index: number,
      list: DoublyLinkedList<T, Y>,
    ) => A,
    initial: A,
  ): A {
    let acc = initial,
      i = 0;
    for (let n = this.head; n; n = n.next) {
      acc = reducer(acc, n.value, i++, this);
    }
    return acc;
  }

  /**
   * @author ChatGPT5
   *
   * Reduce starting from a given index down to the neutral head (index 0),
   * visiting the start element and the head (inclusive) in reverse order:
   *   startIndex, startIndex-1, ..., 1, 0
   *
   * Returns `undefined` if `startIndex` is out of range.
   *
   * @param startIndex 0-based index to start from (must be in [0, length-1]).
   * @param reducer    Function called with (acc, value, index, list) each step.
   * @param initial    Initial accumulator value.
   * @returns The accumulated result, or `undefined` if `startIndex` invalid.
   */
  public reduceToNeutral<A>(
    startIndex: number,
    reducer: (
      acc: A,
      value: T,
      index: number,
      list: DoublyLinkedList<T, Y>,
    ) => A,
    initial: A,
  ): A | undefined {
    const start = this.getNode(startIndex); // assumes your private getNode exists
    if (!start) return undefined;

    let acc = initial;
    let node = start;
    let i = startIndex;

    while (node) {
      acc = reducer(acc, node.value, i, this);
      if (i === 0) break; // reached neutral (head)
      node = node.prev!;
      i--;
    }

    return acc;
  }
}
