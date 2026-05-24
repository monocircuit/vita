/**
 * Parsed components of an ISO date string in the form `YYYY-MM-DD`.
 *
 * All values are expected to represent a valid calendar date.
 */
export interface ParsedIso {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}
