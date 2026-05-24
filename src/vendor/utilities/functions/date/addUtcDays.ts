/**
 * Add a number of days to a UTC date (using UTC fields).
 *
 * @param date Base date.
 * @param deltaDays Days to add (negative supported).
 * @returns New `Date` shifted by the requested number of days (UTC).
 */
export function addUtcDays(date: Date, deltaDays: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + deltaDays),
  );
}
