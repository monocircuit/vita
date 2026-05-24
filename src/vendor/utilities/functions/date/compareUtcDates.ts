/**
 * Compare two dates by their epoch time.
 *
 * @param a First date.
 * @param b Second date.
 * @returns `-1` if `a < b`, `0` if equal, `1` if `a > b`.
 */
export function compareUtcDates(a: Date, b: Date): number {
  const ta = a.getTime();
  const tb = b.getTime();
  return ta === tb ? 0 : ta < tb ? -1 : 1;
}
