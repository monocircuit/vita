import { pad2 } from "./pad2";

/**
 * Convert a `Date` to an ISO date string (`YYYY-MM-DD`) using UTC fields.
 *
 * @param date JavaScript `Date`.
 * @returns ISO date string derived from UTC components.
 */
export function utcDateToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}-${pad2(m)}-${pad2(d)}`;
}
