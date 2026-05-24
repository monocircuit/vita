/**
 * A single day cell in a fixed 6x7 month grid.
 */
export interface CalendarCell {
  /** ISO date in the form `YYYY-MM-DD` (UTC). */
  iso: string;
  /** Day of month number. */
  day: number;
  /** Whether this day belongs to the currently rendered month. */
  isInMonth: boolean;
}
