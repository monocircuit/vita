/**
 * Convert JS weekday index to Monday-based index.
 *
 * JavaScript: `Sun=0..Sat=6` → Monday-based: `Mon=0..Sun=6`.
 *
 * @param date Date to read (UTC day-of-week).
 * @returns Monday-based day index.
 */
export function dayOfWeekMon0(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}
