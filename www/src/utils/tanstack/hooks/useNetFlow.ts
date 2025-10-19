import {
  useQueryClient,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";
import { useFull, Net, NetFull, NetSlim } from "@/hooks/useFull";

import {
  BaseCache,
  createBaseCache,
} from "@/utils/tanstack/cache/createBaseCache";

import {
  mergeIntoBaseCache,
  type MergeIntoBaseCacheOptions,
} from "@/utils/tanstack/cache/mergeIntoBaseCache";

// shallow guard for setQueryData, to avoid pseudo updates
export function setQueryDataIfChanged<T>(
  qc: ReturnType<typeof useQueryClient>,
  key: QueryKey,
  producer: (old: T | undefined) => T,
  isEqual: (a: T | undefined, b: T) => boolean = (a, b) => Object.is(a, b),
) {
  qc.setQueryData<T>(key, old => {
    const next = producer(old as T | undefined);
    return isEqual(old as T | undefined, next) ? (old as T) : next;
  });
}

export const shallowEqualObj = (a?: any, b?: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

type Slimmer<TFull, TSlimKey extends keyof TFull> = (
  full: NetFull<TFull>,
) => NetSlim<TFull, TSlimKey>;

/** Configuration for writing Full→Base using the new Base-Cache API */
interface BaseFlowConfig<TFull, TRawRow, TRow, TStored> {
  /** React Query key for the base cache */
  baseKey: QueryKey;
  /** How to create a fresh empty base cache (indices/scopes can be preseeded) */
  createEmpty?: () => BaseCache<TStored>;
  /** How to merge the incoming *full* payload into the base cache */
  mergeOptions: MergeIntoBaseCacheOptions<TFull, TRawRow, TRow, TStored>;
}

interface UseNetFlowOptions<
  TFull,
  TSlimKey extends keyof TFull,
  TError,
  TRawRow,
  TRow,
  TStored,
> {
  /** Query returning Net<TFull, TSlimKey> */
  query: UseQueryResult<Net<TFull, TSlimKey>, TError>;
  /** Net-query key that will be slimmed after merging */
  netKey: QueryKey;

  /** Base-cache flow: where and how to merge Full → Base */
  base: BaseFlowConfig<TFull, TRawRow, TRow, TStored>;

  /** How the slim representation looks (ids + _slim: true, etc.) */
  toSlim: Slimmer<TFull, TSlimKey>;

  /** Optional enable */
  isEnabled?: boolean;
}

/**
 * useNetFlow:
 * - waits for Full data (via `useFull`)
 * - merges Full → BaseCache using `mergeIntoBaseCache`
 * - then slims the Net-query entry (ids, _slim: true) with a guarded setQueryData
 */
export function useNetFlow<
  TFull,
  TSlimKey extends keyof TFull,
  TError = unknown,
  TRawRow = any,
  TRow = any,
  TStored = any,
>(opts: UseNetFlowOptions<TFull, TSlimKey, TError, TRawRow, TRow, TStored>) {
  const { query, netKey, base, toSlim, isEnabled = true } = opts;
  const qc = useQueryClient();

  useFull<TFull, TSlimKey, TError>(
    query,
    qFull => {
      const full = qFull.data;

      // (1) Full → Base (single place to define rows/keys/indices/scopes)
      qc.setQueryData<BaseCache<TStored>>(base.baseKey, old => {
        const next = old ?? base.createEmpty?.() ?? createBaseCache<TStored>();
        mergeIntoBaseCache(next, full, base.mergeOptions);
        return next;
      });

      // (2) Net-Query → Slim (guard against identical updates)
      const slim = toSlim(full);
      setQueryDataIfChanged(
        qc,
        netKey,
        () => slim,
        (a, b) => shallowEqualObj(a, b),
      );
    },
    { isEnabled },
  );

  return query; // pass-through status if needed by caller
}
