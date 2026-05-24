import { compareUtcDates } from "./compareUtcDates";
import { isoToUtcDate } from "./isoToUtcDate";

/**
 * Check whether an ISO date (`YYYY-MM-DD`) falls within optional min/max ISO bounds.
 *
 * Bounds are treated as inclusive and compared at UTC midnight.
 *
 * @param iso Date to test.
 * @param minIso Optional minimum bound.
 * @param maxIso Optional maximum bound.
 * @returns `true` if within bounds (inclusive); otherwise `false`.
 */
export function isWithinBounds(iso: string, minIso?: string, maxIso?: string): boolean {
  const d = isoToUtcDate(iso);
  if (!d) return false;

  const minD = minIso ? isoToUtcDate(minIso) : null;
  const maxD = maxIso ? isoToUtcDate(maxIso) : null;

  if (minD && compareUtcDates(d, minD) < 0) return false;
  if (maxD && compareUtcDates(d, maxD) > 0) return false;
  return true;
}
