import { useEffect, useRef } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export type NetFull<T> = T & { _slim?: false };
export type NetSlim<T, K extends keyof T> = Pick<T, K> & {
  ids: string[];
  _slim: true;
};
export type Net<T, K extends keyof T> = null | NetFull<T> | NetSlim<T, K>;

export function defaultIsFull<T, K extends keyof T>(
  x: Net<T, K>,
): x is NetFull<T> {
  return !!x && (!("_slim" in x) || (x as any)._slim !== true);
}

function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

/** Query-Typ für den Erfolgspfad: data ist definiert */
type SuccessQueryResult<TData, TError> = Omit<
  UseQueryResult<TData, TError>,
  "data" | "status" | "isSuccess" | "isError" | "isLoading"
> & {
  data: TData;
  status: "success";
  isSuccess: true;
  isError: false;
  isLoading: false;
};

interface UseFullOptions<TFull> {
  isEnabled?: boolean;
  equalityFn?: (prev: NetFull<TFull> | null, next: NetFull<TFull>) => boolean;
}

/**
 * onFull bekommt eine Query im "success"-Shape:
 * - data: NetFull<TFull> (nicht optional)
 * - isSuccess: true, status: 'success'
 */
export function useFull<TFull, TSlimKeys extends keyof TFull, TError = unknown>(
  query: UseQueryResult<Net<TFull, TSlimKeys>, TError>,
  onFull: (q: SuccessQueryResult<NetFull<TFull>, TError>) => void,
  opts: UseFullOptions<TFull> = { isEnabled: true, equalityFn: shallowEqual },
  isFull: (
    x: Net<TFull, TSlimKeys>,
  ) => x is NetFull<TFull> = defaultIsFull as any,
) {
  const { isEnabled = true, equalityFn = shallowEqual } = opts;
  const lastRef = useRef<NetFull<TFull> | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    if (!query.isSuccess) return;

    const data = query.data;
    if (!isFull(data as Net<TFull, TSlimKeys>)) return;

    const next = data as NetFull<TFull>;
    if (equalityFn(lastRef.current, next)) return;

    lastRef.current = next;

    // Für den Callback ein "success"-Query-Objekt mit garantiertem data bauen:
    const successQuery = {
      ...query,
      data: next,
      status: "success" as const,
      isSuccess: true as const,
      isError: false as const,
      isLoading: false as const,
    } as SuccessQueryResult<NetFull<TFull>, TError>;

    onFull(successQuery);
  }, [isEnabled, query.isSuccess, query.dataUpdatedAt]);
}
