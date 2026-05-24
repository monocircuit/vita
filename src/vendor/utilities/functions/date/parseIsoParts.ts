import type { ParsedIso } from "./types/ParsedIso";

/**
 * Parse an ISO date string in the exact form `YYYY-MM-DD`.
 *
 * This validates that the resulting UTC date round-trips back to the same
 * components (rejects invalid dates like `2025-02-31`).
 *
 * @param iso ISO date string.
 * @returns Parsed parts, or `null` if invalid.
 */
export function parseIsoParts(iso: string): ParsedIso | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year) return null;
  if (date.getUTCMonth() !== month - 1) return null;
  if (date.getUTCDate() !== day) return null;

  return { year, month, day };
}
