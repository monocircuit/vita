import { parseIsoParts } from "./parseIsoParts";

/**
 * Convert an ISO date string (`YYYY-MM-DD`) to a `Date` representing midnight UTC.
 *
 * @param iso ISO date string.
 * @returns `Date` at `00:00:00.000Z`, or `null` if the input is invalid.
 */
export function isoToUtcDate(iso: string): Date | null {
  const parts = parseIsoParts(iso);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}
