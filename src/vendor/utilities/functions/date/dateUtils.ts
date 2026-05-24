export interface ParsedIso {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

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

export function isoToUtcDate(iso: string): Date | null {
  const parts = parseIsoParts(iso);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function utcDateToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addUtcDays(date: Date, deltaDays: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + deltaDays),
  );
}

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

function compareUtcDates(a: Date, b: Date): number {
  const ta = a.getTime();
  const tb = b.getTime();
  return ta === tb ? 0 : ta < tb ? -1 : 1;
}

export function isWithinBounds(iso: string, minIso?: string, maxIso?: string): boolean {
  const d = isoToUtcDate(iso);
  if (!d) return false;

  const minD = minIso ? isoToUtcDate(minIso) : null;
  const maxD = maxIso ? isoToUtcDate(maxIso) : null;

  if (minD && compareUtcDates(d, minD) < 0) return false;
  if (maxD && compareUtcDates(d, maxD) > 0) return false;
  return true;
}

function dayOfWeekMon0(date: Date): number {
  // JS: Sun=0..Sat=6 -> Mon=0..Sun=6
  return (date.getUTCDay() + 6) % 7;
}

export interface CalendarCell {
  iso: string;
  day: number;
  isInMonth: boolean;
}

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
