import { Coordinates } from "@/vendor/utilities/types";

/**
 * Normalizes a coordinate vector to unit length.
 *
 * @param vector - Vector to normalize.
 * @returns The normalized vector. Returns `{ x: 0, y: 0 }` for zero-length vectors.
 *
 * @author Lukas Diegelmann
 */
export function normalizeCoordinates(vector: Coordinates): Coordinates {
  const len = Math.hypot(vector.x, vector.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: vector.x / len, y: vector.y / len };
}
