/**
 * Get the first day of the month at midnight UTC.
 *
 * @param date Any date within the month.
 * @returns `Date` at the first of that month (`00:00:00.000Z`).
 */
export function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
