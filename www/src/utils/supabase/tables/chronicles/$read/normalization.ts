import { normalizeTimestamps } from "../../$read";
import { oTChronicle } from "../mapping";

/**
 * @author ChatGPT5
 *
 * Normalisiert eine Chronicle-Row:
 * - `id` zu String
 * - `knots: string[]` -> `number[]` (ms since epoch)
 * - Bei nur 1 Knoten wird `Infinity` angehängt (wie in deiner bestehenden Logik)
 */
export function normalizeChronicle(row: any): oTChronicle {
  const id = String(row.id);

  // Knots adjustments
  const knots: number[] = Array.isArray(row.knots)
    ? row.knots.map((k: string) => Date.parse(k))
    : [];

  if (knots.length % 2 != 0) knots.push(Infinity);

  // Rückgabe im oTChronicle-Shape (und restliche Felder durchreichen)
  return { ...row, id, knots, ...normalizeTimestamps(row) } as oTChronicle;
}
