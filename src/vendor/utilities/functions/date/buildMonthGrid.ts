import type { CalendarCell } from "./types/CalendarCell";

import { addUtcDays } from "./addUtcDays";
import { dayOfWeekMon0 } from "./dayOfWeekMon0";
import { startOfUtcMonth } from "./startOfUtcMonth";
import { utcDateToIso } from "./utcDateToIso";

/**
 * Build a fixed 6x7 calendar grid (42 cells) for the month containing `monthStart`.
 *
 * The grid starts on Monday and includes leading/trailing days from adjacent months.
 *
 * @param monthStart Any date within the target month (UTC).
 * @returns Array of 42 calendar cells.
 */
export function buildMonthGrid(monthStart: Date): CalendarCell[] {
  const first = startOfUtcMonth(monthStart);
  const offset = dayOfWeekMon0(first);
  const gridStart = addUtcDays(first, -offset);

  const monthIndex = first.getUTCMonth();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = addUtcDays(gridStart, i);
    const iso = utcDateToIso(d);
    cells.push({
      iso,
      day: d.getUTCDate(),
      isInMonth: d.getUTCMonth() === monthIndex,
    });
  }

  return cells;
}
