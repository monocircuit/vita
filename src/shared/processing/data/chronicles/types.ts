// src/shared/processing/data/chronicles/types.ts

/**
 * Engine-internes Chronicle-Segment. Ersetzt
 * `Schemas["Chronicles"]["Mutations"]["Engine"]` aus der gelöschten Bridge-Schicht.
 *
 * Erzeugt durch `chroniclesToEngineSegments(chronicles)`: ein Chronicle mit
 * `knots: number[]` (paarweise: Start, End, Start, End, ...) wird in N
 * Segmente mit `knots: { start, end }` zerlegt. Bei ungerader Anzahl an Knots
 * läuft das letzte Segment bis `Math.max(Date.now(), lastStart)` ("läuft noch").
 */
export type EngineChronicle = {
  id: number;
  knots: { start: number; end: number };
};

/**
 * Engine-internes Shard. Was `Engine.toShards()` ausspuckt — der `vitaId`-Wert
 * wird vom Caller (EditorWorkspace) ergänzt, bevor das Array via
 * `window.api.shards.replaceForVita` persistiert wird.
 */
export type EngineShard = {
  id: number;
  chronicleId: number;
  x: number;
  y: number;
  prevId: number | null;
  nextId: number | null;
};
