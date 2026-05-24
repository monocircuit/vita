import { Schemas } from "@/shared/data/schemas";

/**
 * @author Lukas Diegelmann
 *
 * Prüft, ob zwei "Engine"-Chronicle-Segmente sich zeitlich/positionell überlappen.
 *
 * Annahmen über die Form des Inputs:
 * - `engineChronicleX.knots.start` ist eine Zahl (Startposition/Zeitpunkt).
 * - `engineChronicleX.knots.end` ist entweder eine Zahl (Ende) oder ein falsy Wert
 *   (z.B. `undefined`) und bedeutet "offenes Ende" (∞).
 *
 * Rückgabe:
 * - `true` wenn sich die beiden Segmente überlappen, sonst `false`.
 *
 * Logikübersicht / Regeln:
 * - Falls eines der Segmente kein `end` hat (offenes Ende) und das andere ein `end`,
 *   vergleicht die Funktion das vorhandene `end` mit dem `start` des offenen Segments.
 * - Wenn beide Segmente kein `end` haben, gelten sie als überlappend (true).
 * - Wenn beide ein `end` haben, prüft die Funktion, ob das Ende eines Segments
 *   über den Start des anderen hinausgeht (einfacher Überlappungscheck).
 *
 * Beispiel:
 * ```ts
 * const a = { knots: { start: 10, end: 20 } };
 * const b = { knots: { start: 15, end: 30 } };
 * checkEngineChronicleOverlap(a, b); // true
 *
 * const c = { knots: { start: 40 } }; // offenes Ende
 * checkEngineChronicleOverlap(a, c); // false (a.end=20 <= c.start=40)
 *```
 *
 * Komplexität: O(1) — konstante Anzahl von Vergleichen.
 *
 * Hinweis: Diese Hilfsfunktion erwartet bereits normalisierte / "engine"-Segments
 * (z.B. Ergebnis einer Mutation `Engine.To`) und nicht rohe DB-Rows.
 */
const checkEngineChronicleOverlap = (
  engineChronicleA: Schemas["Chronicles"]["Mutations"]["Engine"],
  engineChronicleB: Schemas["Chronicles"]["Mutations"]["Engine"],
) => {
  if (!engineChronicleA.knots.end && engineChronicleB.knots.end) {
    return engineChronicleB.knots.end > engineChronicleA.knots.start;
  } else if (engineChronicleA.knots.end && !engineChronicleB.knots.end) {
    return engineChronicleA.knots.end > engineChronicleB.knots.start;
  } else if (!engineChronicleA.knots.end && !engineChronicleB.knots.end) {
    return true;
  }

  return (
    (engineChronicleA.knots.end as number) > engineChronicleB.knots.start ||
    (engineChronicleB.knots.end as number) > engineChronicleA.knots.start
  );
};

export default checkEngineChronicleOverlap;
