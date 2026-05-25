// src/shared/processing/data/chronicles/chroniclesToEngineSegments.ts

import type { EngineChronicle } from "./types";

interface ChronicleLike {
  id: number;
  knots: number[];
}

/**
 * Zerlegt Chronicles mit `knots: number[]` in Engine-Segmente (paarweise
 * `{ start, end }`). Bei ungerader Knot-Anzahl läuft das letzte Segment bis
 * `Math.max(Date.now(), lastStart)` ("offenes" Chronicle).
 *
 * Reine Funktion — keine Zod-Validation. Caller stellt sicher, dass die
 * Inputs bereits normalisiert sind (`knots: number[]`).
 */
export function chroniclesToEngineSegments(
  chronicles: ChronicleLike[],
): EngineChronicle[] {
  const out: EngineChronicle[] = [];

  for (const chronicle of chronicles) {
    if (!chronicle.knots || chronicle.knots.length === 0) continue;

    if (chronicle.knots.length === 2) {
      out.push({
        id: chronicle.id,
        knots: { start: chronicle.knots[0], end: chronicle.knots[1] },
      });
      continue;
    }

    let i = 0;
    while (i < chronicle.knots.length - 1) {
      out.push({
        id: chronicle.id,
        knots: { start: chronicle.knots[i], end: chronicle.knots[i + 1] },
      });
      i += 2;
    }

    if (i === chronicle.knots.length - 1) {
      const start = chronicle.knots[i];
      out.push({
        id: chronicle.id,
        knots: { start, end: Math.max(Date.now(), start) },
      });
    }
  }

  return out;
}
