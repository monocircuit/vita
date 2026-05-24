/**
 * Left-pad a number to two digits.
 *
 * @param n Number to pad.
 * @returns Two-digit string (e.g. `3 -> "03"`).
 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
