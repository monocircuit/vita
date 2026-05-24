import { Coordinates } from "@/vendor/utilities/types";

/**
 * Computes the midpoint between two coordinates.
 *
 * @param a - First coordinate.
 * @param b - Second coordinate.
 * @returns The midpoint coordinate between `a` and `b`.
 *
 * @author Lukas Diegelmann
 */
export function getMidpointCoordinates(a: Coordinates, b: Coordinates): Coordinates {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}