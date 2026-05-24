/**
 * Add a number of months to a UTC date (using UTC fields).
 *
 * If the target month has fewer days than the source day, the day is clamped
 * to the last day of the target month.
 *
 * @param date Base date.
 * @param deltaMonths Months to add (negative supported).
 * @returns New `Date` shifted by months in UTC.
 */
export function addUtcMonths(date: Date, deltaMonths: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();

  const next = new Date(Date.UTC(y, m + deltaMonths, 1));
  const daysInNextMonth = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const clampedDay = Math.min(d, daysInNextMonth);
  return new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), clampedDay));
}
