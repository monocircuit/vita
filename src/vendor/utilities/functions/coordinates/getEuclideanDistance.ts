import { Coordinates } from "@/vendor/utilities/types";

/**
 * Calculates the euclidean distance between two coordinates.
 *
 * @param a - First coordinate.
 * @param b - Second coordinate.
 * @returns The euclidean distance between `a` and `b`.
 *
 * @author Lukas Diegelmann
 */
export function getEuclideanDistance(a: Coordinates, b: Coordinates): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}