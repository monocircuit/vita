/**
 * Namespaced helper types for `BaseCache`. Collected under the class name
 * to keep the public API tidy and discoverable via `BaseCache.*`.
 * These types are meant to be used by callers when configuring and consuming the cache,
 * e.g. `BaseCache.TIndexKey<MyRow>`.
 * All types here are purely compile-time constructs (no runtime emission).
 * @author Lukas Diegelmann
 */
export namespace BaseCache {
  /**
   * A valid index key of the cached row type `T`. Must be a string key of `T`
   * because indices are addressable by string names (column names).
   * @example
   * type IK = BaseCache.TIndexKey<{ id: string; user_id: string }>;
   * //    ^? "id" | "user_id"
   * @author Lukas Diegelmann
   */
  export type TIndexKey<T> = keyof T & string;

  /**
   * The finalized primary key string used as object key in the cache.
   * Produced by hashing the configured primary key parts for a row.
   * @author Lukas Diegelmann
   */
  export type TPrimaryKey = string;

  /**
   * A single cell value suitable for being part of a primary key.
   * Only scalar, comparable values are allowed (no arrays/objects).
   * Dates are allowed and will be stringified during hashing.
   * @author Lukas Diegelmann
   */
  export type TPrimaryKeyPart = string | number | bigint | Date | boolean;

  /**
   * A tuple of primary key parts representing a composite primary key.
   * @author Lukas Diegelmann
   */
  export type TPrimaryKeyParts = TPrimaryKeyPart[];

  /**
   * A "loaded" mark describing which scope value has been fully loaded.
   * This supports downstream read-logic (e.g., avoid refetching known scopes).
   * @author Lukas Diegelmann
   */
  export interface ILoadedMark<T> {
    scope: TIndexKey<T>;
    value: string | number;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Options to customize the behavior of `merge`. You can tell the cache how to
   * extract rows from a full payload, how to normalize them, which indices to
   * maintain, and how to mark `loaded` scopes either from the full payload,
   * per row, or derived from index values.
   */
  export interface IMergeOptions<T, TFull, TRaw = T> {
    /**
     * @author Lukas Diegelmann
     *
     * If `source` is not an array, use this to extract the row list.
     * If `source` is already an array, this is ignored.
     */
    selectRows?: (full: TFull) => readonly TRaw[];

    /**
     * @author Lukas Diegelmann
     *
     * Row normalization function, turning raw input into the cache’s row type `T`.
     * Defaults to identity if `TRaw` is already `T`.
     */
    normalizeRow?: (raw: TRaw) => T;

    /**
     * @author Lukas Diegelmann
     *
     * List of column keys to maintain as secondary indices for the incoming rows.
     */
    indices?: readonly TIndexKey<T>[];

    /**
     * @author Lukas Diegelmann
     *
     * Provide additional loaded marks that should be set once per full payload
     * (e.g., “user_id: u42 is fully loaded”).
     */
    markLoadedFromFull?: (full: TFull) => readonly ILoadedMark<T>[];

    /**
     * @author Lukas Diegelmann
     *
     * Provide loaded marks per normalized row (optional).
     */
    markLoadedFromRow?: (row: T) => readonly ILoadedMark<T>[];

    /**
     * @author Lukas Diegelmann
     *
     * If true (default), also derive loaded marks from actual index values of each row.
     * This is convenient when “loaded” semantics match index coverage.
     */
    trackLoadedFromIndices?: boolean;
  }

  /**
   * @author Lukas Diegelmann
   *
   * A small statistics object returned by `merge`, describing what changed:
   * how many rows were inserted vs. updated, and the total number touched.
   */
  export interface IMergeStats {
    inserted: number;
    updated: number;
    touched: number; // inserted + updated
  }
}

/**
 * @author Lukas Diegelmann
 *
 * A generic, typed base in-memory cache that stores normalized rows keyed by a hashed
 * (possibly composite) primary key and maintains optional secondary indices.
 * It also tracks loaded scopes to coordinate incremental fetch logic upstream.
 * The API is designed to be ergonomic for both batch merges and single-row updates,
 * e.g., from real-time events or mutations.
 * All internal maps are plain object maps for O(1) access and minimal overhead.
 */
export class BaseCache<T> {
  /**
   * @author Lukas Diegelmann
   *
   * @internal primary key hash separator. Escaped if present in values.
   */
  private readonly PRIMARY_KEY_HASH_SEP = "|";

  /**
   * @author Lukas Diegelmann
   *
   * @internal primary key hash substitute for `null`.
   */
  private readonly PRIMARY_KEY_HASH_NIL = "∅";

  /**
   * @author Lukas Diegelmann
   *
   * @internal primary key hash escape char.
   */
  private readonly PRIMARY_KEY_HASH_ESC = "\\";

  /**
   * @author Lukas Diegelmann
   *
   * The ordered list of keys from `T` that form the composite primary key.
   * The actual primary key string is produced by hashing the values for these parts.
   */
  public readonly primaryKeyParts: (keyof T)[];

  /**
   * @author Lukas Diegelmann
   *
   * Primary store: maps hashed primary key strings to stored rows.
   */
  public readonly byPrimaryKey: Record<BaseCache.TPrimaryKey, T>;

  /**
   * @author Lukas Diegelmann
   *
   * Insertion order of all known primary keys. Useful for iteration and stable ordering.
   */
  public readonly allPrimaryKeys: BaseCache.TPrimaryKey[];

  /**
   * @author Lukas Diegelmann
   *
   * Secondary indices: `index[indexName][valueHash] = BaseCache.TPrimaryKey[]`.
   * This enables O(1) lookups of “all rows that share an index value”.
   */
  public readonly index: Partial<
    Record<BaseCache.TIndexKey<T>, Record<string, BaseCache.TPrimaryKey[]>>
  >;

  /**
   * @author Lukas Diegelmann
   *
   * Loaded flags: `loaded[indexName]` stores a Set of scope values (string|number)
   * that are known to be fully loaded. This helps prevent redundant fetches.
   */
  public readonly loaded: Partial<
    Record<BaseCache.TIndexKey<T>, Set<string | number>>
  >;

  /**
   * @author Lukas Diegelmann
   *
   * Creates a new cache with the given primary key parts and pre-initialized index/loaded maps.
   * Use the static `create` to instantiate; `constructor` is kept private to encourage consistency.
   */
  private constructor(primaryKeyParts: (keyof T)[]) {
    this.primaryKeyParts = primaryKeyParts;
    this.byPrimaryKey = Object.create(null);
    this.allPrimaryKeys = [];
    this.index = Object.create(null);
    this.loaded = Object.create(null);
  }

  /**
   * @author Lukas Diegelmann
   *
   * Factory to create a cache with composite primary key parts and predefined index keys.
   * Ensures internal maps are initialized for the given indices.
   * @example
   * const cache = BaseCache.create<MyRow>(["id"], ["user_id", "type"]);
   */
  static create<U>(
    primaryKeyParts: (keyof U)[],
    indexKeys: BaseCache.TIndexKey<U>[],
  ): BaseCache<U> {
    const cache = new BaseCache<U>(primaryKeyParts);
    for (const k of indexKeys ?? []) {
      cache.index[k] = Object.create(null);
      cache.loaded[k] = new Set();
    }
    return cache;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Creates a new empty cache instance that preserves current index/loaded structure
   * but contains no rows. Useful for resets without losing configured shapes.
   */
  public cloneEmpty(): BaseCache<T> {
    const next = new BaseCache<T>(this.primaryKeyParts);
    for (const k of Object.keys(this.index) as BaseCache.TIndexKey<T>[]) {
      next.index[k] = Object.create(null);
      next.loaded[k] = new Set();
    }
    return next;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Clears all stored rows and buckets while keeping the index and loaded shape.
   * After calling, the cache is empty but still configured the same way.
   */
  public reset(): void {
    for (const pk of Object.keys(this.byPrimaryKey))
      delete this.byPrimaryKey[pk];
    this.allPrimaryKeys.length = 0;
    for (const k of Object.keys(this.index) as BaseCache.TIndexKey<T>[]) {
      this.index[k] = Object.create(null);
      this.loaded[k]?.clear();
    }
  }

  /**
   * @author Lukas Diegelmann
   *
   * Ensures that both the `index` and `loaded` structures for a given index key
   * exist and are properly initialized.
   * If either the `index[indexKey]` map or the `loaded[indexKey]` set does not
   * yet exist, this method will create them. This guarantees that subsequent
   * write operations on this index key (e.g., during `upsert` or `markLoaded`)
   * can safely proceed without null checks.
   *
   * @param indexKey The name of the index key (column) to ensure existence for.
   * @example
   * cache.ensureIndexKey("user_id");
   * // → cache.index["user_id"] and cache.loaded["user_id"] now exist
   */
  public ensureIndexKey(indexKey: BaseCache.TIndexKey<T>) {
    if (!this.index[indexKey]) this.index[indexKey] = Object.create(null);
    if (!this.loaded[indexKey]) this.loaded[indexKey] = new Set();
  }

  /**
   * @author Lukas Diegelmann
   *
   * Returns a concretely typed index map for writes, creating it if missing.
   * This narrows the generic index access to a specific `Record<string, BaseCache.TPrimaryKey[]>`
   * so TypeScript allows writes (avoids TS2862 issues).
   */
  private getIndexMap(
    name: BaseCache.TIndexKey<T>,
  ): Record<string, BaseCache.TPrimaryKey[]> {
    return (this.index[name] ??= Object.create(null) as Record<
      string,
      BaseCache.TPrimaryKey[]
    >);
  }

  /**
   * @author Lukas Diegelmann
   *
   * Produces a stable, reversible string hash for a tuple of PK parts.
   * This escapes separators/escapes and substitutes `null` with a sentinel
   * to avoid collisions.
   */
  private hashPrimaryKeyParts(
    primaryKeyParts: BaseCache.TPrimaryKeyParts,
  ): BaseCache.TPrimaryKey {
    return primaryKeyParts
      .map(primaryKeyPart => {
        if (primaryKeyPart === null) {
          return this.PRIMARY_KEY_HASH_NIL;
        }

        const string = String(primaryKeyPart);

        return (
          string
            // \  -> \\
            .replaceAll(
              this.PRIMARY_KEY_HASH_ESC,
              this.PRIMARY_KEY_HASH_ESC + this.PRIMARY_KEY_HASH_ESC,
            )
            // |  -> \|
            .replaceAll(
              this.PRIMARY_KEY_HASH_SEP,
              this.PRIMARY_KEY_HASH_ESC + this.PRIMARY_KEY_HASH_SEP,
            )
        );
      })
      .join(this.PRIMARY_KEY_HASH_SEP);
  }

  /**
   * @author Lukas Diegelmann
   *
   * Selects the configured primary key parts from a row in the defined order.
   */
  private selectPrimaryKeyParts(item: T): BaseCache.TPrimaryKeyParts {
    const parts: BaseCache.TPrimaryKeyParts = [];
    for (const PRIMARY_KEY_PART of this.primaryKeyParts) {
      parts.push(item[PRIMARY_KEY_PART] as BaseCache.TPrimaryKeyPart);
    }
    return parts;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Computes the hashed primary key string for a given row according to the
   * configured `primaryKeyParts`.
   */
  private getHashedPrimaryKey(item: T): BaseCache.TPrimaryKey {
    return this.hashPrimaryKeyParts(this.selectPrimaryKeyParts(item));
  }

  /**
   * @author Lukas Diegelmann
   *
   * Normalizes an index raw value to a list of PK-part tuples.
   * Accepts:
   *  - scalar → [[scalar]]
   *  - scalar[] → [[s1], [s2], …]
   *  - (scalar[])[] (tuple[]) → [[...t1], [...t2], …]
   * Nullish values are ignored; duplicate scalars are deduplicated by signature.
   */
  private normalizeToKeyPartsList(raw: unknown): BaseCache.TPrimaryKeyParts[] {
    if (!Array.isArray(raw)) {
      const s = this.toPkPart(raw);
      return s == null ? [] : [[s]];
    }

    if (raw.length === 0) return [];

    if (Array.isArray(raw[0])) {
      // array of tuples
      const out: BaseCache.TPrimaryKeyParts[] = [];
      for (const tupleLike of raw as unknown[]) {
        if (!Array.isArray(tupleLike) || tupleLike.length === 0) continue;
        const tuple: BaseCache.TPrimaryKeyPart[] = [];
        for (const v of tupleLike) {
          const p = this.toPkPart(v);
          if (p == null) continue;
          tuple.push(p);
        }
        if (tuple.length > 0) out.push(tuple);
      }
      return out;
    } else {
      // array of scalars
      const seen = new Set<string>();
      const out: BaseCache.TPrimaryKeyParts[] = [];
      for (const v of raw as unknown[]) {
        const p = this.toPkPart(v);
        if (p == null) continue;
        const sig = this.sigOfScalar(p);
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push([p]);
      }
      return out;
    }
  }

  /**
   * @author Lukas Diegelmann
   *
   * Coerces an unknown value to a valid PK part (scalar). Dates are allowed.
   * Returns `null` for unsupported types if you want to be strict; here we
   * allow a tolerant fallback by stringifying other values.
   */
  private toPkPart(v: unknown): BaseCache.TPrimaryKeyPart | null {
    if (v == null) return null;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      typeof v === "bigint" ||
      v instanceof Date
    ) {
      return v as BaseCache.TPrimaryKeyPart;
    }
    // tolerant fallback: stringify unknown scalar-likes
    return String(v) as unknown as BaseCache.TPrimaryKeyPart;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Produces a stable signature string for deduplicating scalar values.
   * Dates are compared via time value; bigint by decimal string.
   */
  private sigOfScalar(v: BaseCache.TPrimaryKeyPart): string {
    return v instanceof Date
      ? `date:${v.getTime()}`
      : typeof v === "bigint"
        ? `bigint:${v.toString()}`
        : `${typeof v}:${String(v)}`;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Converts a tuple of index parts to a `loaded` set value. For single scalars,
   * the scalar is used (string/number preferred). For tuples, a stable string
   * (same hash format as index) is produced to uniquely identify the scope value.
   */
  private toLoadedValue(
    parts: readonly BaseCache.TPrimaryKeyPart[],
  ): string | number | null {
    if (parts.length === 0) return null;

    if (parts.length === 1) {
      const only = parts[0];
      if (typeof only === "number") return only;
      if (typeof only === "string") return only;
      if (typeof only === "boolean") return only ? "true" : "false";
      if (typeof only === "bigint") return only.toString();
      if (only instanceof Date) return only.toISOString();
      return String(only);
    }

    // tuple → stable string via same hashing format:
    return this.hashPrimaryKeyParts(parts as BaseCache.TPrimaryKeyParts);
  }

  /**
   * @author Lukas Diegelmann
   *
   * Inserts or updates a **single row** and maintains all specified indices.
   * Optionally also tracks `loaded` scope values derived from the actual index values.
   *
   * @param item The normalized row to insert or update.
   * @param indices Index keys (columns) to maintain (buckets updated accordingly).
   * @param opts.trackLoadedFromIndices If `true`, store derived loaded marks per index value.
   *                                    Defaults to `false` to keep behavior minimal.
   * @returns The hashed primary key for the item.
   * @example
   * cache.upsert(row, ["user_id", "type"], { trackLoadedFromIndices: true });
   */
  public upsert(
    item: T,
    indices: BaseCache.TIndexKey<T>[],
    opts?: { trackLoadedFromIndices?: boolean },
  ): BaseCache.TPrimaryKey {
    const shouldTrackLoaded = !!opts?.trackLoadedFromIndices;

    // 1) Primary key build & store
    const primaryKey = this.getHashedPrimaryKey(item);
    const isExisting = this.byPrimaryKey[primaryKey] !== undefined;

    this.byPrimaryKey[primaryKey] = item;
    if (!isExisting) this.allPrimaryKeys.push(primaryKey);

    // 2) Secondary indices
    for (const INDEX of indices) {
      const RAW = (item as any)[INDEX];
      if (RAW == null) continue;

      this.ensureIndexKey(INDEX);
      const map = this.getIndexMap(INDEX);

      const partsList = this.normalizeToKeyPartsList(RAW);
      const ivSet = new Set<string>(); // dedupe hash writes per row

      for (const parts of partsList) {
        const iv = this.hashPrimaryKeyParts(parts);
        if (ivSet.has(iv)) continue;
        ivSet.add(iv);

        const bucket = (map[iv] ??= []);
        if (!bucket.includes(primaryKey)) bucket.push(primaryKey);

        if (shouldTrackLoaded) {
          const loadedVal = this.toLoadedValue(parts);
          if (loadedVal != null) this.loaded[INDEX]!.add(loadedVal);
        }
      }
    }

    return primaryKey;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Inserts/updates multiple rows efficiently by delegating to `upsert` per row.
   * @param rows Normalized rows to upsert.
   * @param indices Index keys to maintain for each row.
   */
  public upsertMany(
    rows: readonly T[],
    indices: BaseCache.TIndexKey<T>[],
  ): void {
    for (const row of rows) this.upsert(row, indices);
  }

  /**
   * @author Lukas Diegelmann
   *
   * Marks a set of scopes as fully loaded. This is a direct mutator of the `loaded`
   * map and can be used independently of row writes.
   * @param marks Array of `{ scope, value }` pairs to add to `loaded`.
   */
  public markLoaded(
    marks:
      | ReadonlyArray<{ scope: BaseCache.TIndexKey<T>; value: string | number }>
      | undefined,
  ): void {
    if (!marks) return;
    for (const m of marks) {
      this.ensureIndexKey(m.scope);
      this.loaded[m.scope]!.add(m.value);
    }
  }

  /**
   * High-level **batch merge** that “does everything”:
   * - Extract rows from a payload (or accept an array)
   * - Normalize rows
   * - Upsert each row & maintain indices
   * - Set `loaded` marks (from full payload, per row, and/or from indices)
   * - Return a small `{ inserted, updated, touched }` stats object
   *
   * @param source Either an array of rows or a full payload.
   * @param opts Merge options to control extraction, normalization, indices and loaded tracking.
   * @example
   * const stats = cache.merge(payload, {
   *   selectRows: f => f.items,
   *   normalizeRow: r => r,
   *   indices: ["user_id", "type"],
   *   markLoadedFromFull: f => f.user_id ? [{ scope: "user_id", value: f.user_id }] : [],
   *   trackLoadedFromIndices: true,
   * });
   * @author Lukas Diegelmann
   */
  public merge<TFull = T, TRaw = T>(
    source: readonly TRaw[] | TFull,
    opts?: BaseCache.IMergeOptions<T, TFull, TRaw>,
  ): BaseCache.IMergeStats {
    const {
      selectRows,
      normalizeRow = (x: any) => x as unknown as T,
      indices = [],
      markLoadedFromFull,
      markLoadedFromRow,
      trackLoadedFromIndices: shouldTrackLoadedFromIndices = true,
    } = opts ?? {};

    // Rows extraction
    const rawRows: readonly TRaw[] = Array.isArray(source)
      ? source
      : selectRows
        ? (selectRows as any)(source)
        : ([] as readonly TRaw[]);

    // Loaded marks derived from full payload (once)
    if (!Array.isArray(source) && markLoadedFromFull) {
      const marks = markLoadedFromFull(source as TFull) ?? [];
      if (marks.length) this.markLoaded(marks);
    }

    if (!rawRows.length) return { inserted: 0, updated: 0, touched: 0 };

    // Normalize rows
    const rows: T[] = rawRows.map(r => normalizeRow(r));

    // Upsert + loaded tracking
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const id = this.getHashedPrimaryKey(row);
      const isExisting = this.byPrimaryKey[id] !== undefined;

      this.upsert(row, indices as BaseCache.TIndexKey<T>[], {
        trackLoadedFromIndices: shouldTrackLoadedFromIndices,
      });

      if (markLoadedFromRow) {
        const marks = markLoadedFromRow(row) ?? [];
        if (marks.length) this.markLoaded(marks);
      }

      if (isExisting) updated++;
      else inserted++;
    }

    return { inserted, updated, touched: inserted + updated };
  }

  /**
   * @author Lukas Diegelmann
   *
   * Returns the list of primary keys for a given index value.
   * Use this for fast lookups like “all rows for user_id=X”.
   * @param indexName Index (column) name to read from.
   * @param keyParts Index value as PK-part tuple (for composite index keys).
   */
  public idsByIndex(
    indexName: BaseCache.TIndexKey<T>,
    keyParts: BaseCache.TPrimaryKeyParts,
  ): readonly BaseCache.TPrimaryKey[] {
    const ix = this.index[indexName];
    if (!ix) return [];
    const iv = this.hashPrimaryKeyParts(keyParts);
    return ix[iv] ?? [];
  }

  /**
   * @author Lukas Diegelmann
   *
   * Returns the concrete rows for a given index value by mapping ids through
   * the primary store. This is a convenience wrapper over `idsByIndex`.
   * @param indexName Index (column) name to read from.
   * @param keyParts Index value as PK-part tuple (for composite index keys).
   */
  public rowsByIndex(
    indexName: BaseCache.TIndexKey<T>,
    keyParts: BaseCache.TPrimaryKeyParts,
  ): T[] {
    return this.idsByIndex(indexName, keyParts).map(
      id => this.byPrimaryKey[id],
    );
  }
}
