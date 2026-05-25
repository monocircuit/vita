import type { ChronicleView } from "../../../../electron/ipc/contracts";

/**
 * Globale Weltskala: 1 Jahr = X Pixel in World-Space.
 * Dieser Wert steuert die Skalierung aller Renderer-Elemente
 * (Tree, Timeline, Notes, ...). Nur hier ändern.
 */
export const PIXELS_PER_YEAR = 130;

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

export interface WorldScale {
  minMs: number;
  maxMs: number;
  totalDurationMs: number;
  totalYears: number;
  worldWidth: number;
  pixelsPerMs: number;
}

/**
 * Berechnet die Weltskala aus einem Array von Chronicles.
 * Gibt null zurück wenn keine validen Daten vorhanden sind.
 */
export function computeWorldScale(
  chronicles: ChronicleView[] | undefined,
): WorldScale | null {
  const valid =
    chronicles?.filter(c => c && c.knots && c.knots.length > 0) ?? [];
  if (valid.length === 0) return null;

  const minMs = Math.min(...valid.map(c => c.knots[0]));
  const maxMs = Math.max(...valid.map(c => c.knots[c.knots.length - 1]));
  const totalDurationMs = maxMs - minMs;
  if (totalDurationMs <= 0) return null;

  const totalYears = totalDurationMs / MS_PER_YEAR;
  const worldWidth = totalYears * PIXELS_PER_YEAR;
  const pixelsPerMs = worldWidth / totalDurationMs;

  return { minMs, maxMs, totalDurationMs, totalYears, worldWidth, pixelsPerMs };
}

