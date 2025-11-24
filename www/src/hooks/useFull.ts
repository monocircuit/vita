import { useEffect, useRef } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

/* ---- deine Net-Typen / Guards (allgemein gehalten) ---- */
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

/* ---- flacher Vergleich, um unnötige Calls zu vermeiden ---- */
function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* useFull: ruft onFull(full, query) nur bei neuen Full-Daten auf     */
/* ------------------------------------------------------------------ */
interface UseFullOptions<TFull> {
  enabled?: boolean;
  /** return true, wenn „gleich“ -> Callback wird NICHT erneut aufgerufen */
  equalityFn?: (prev: NetFull<TFull> | null, next: NetFull<TFull>) => boolean;
}

export function useFull<
  TFull,
  TSlimKeys extends keyof any,
  TError = unknown,
  TData = Net<TFull, TSlimKeys>,
>(
  query: UseQueryResult<TData, TError>,
  onFull: (args: {
    full: NetFull<TFull>;
    query: UseQueryResult<TData, TError>;
  }) => void,
  opts?: UseFullOptions<TFull>,
  isFull: (x: TData) => x is NetFull<TFull> = defaultIsFull as any,
) {
  const { enabled = true, equalityFn = shallowEqual } = opts ?? {};
  const lastRef = useRef<NetFull<TFull> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!query.isSuccess) return;
    const data = query.data;
    if (!isFull(data as TData)) return;

    const next = data as unknown as NetFull<TFull>;
    const same = equalityFn(lastRef.current, next);
    if (same) return;

    lastRef.current = next;
    onFull({ full: next, query });
    // nur bei echten Daten-Änderungen (dataUpdatedAt) feuern
  }, [enabled, query.isSuccess, query.dataUpdatedAt]);
}
