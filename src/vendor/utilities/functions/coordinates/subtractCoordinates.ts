import { Coordinates } from "@/vendor/utilities/types";

/**
 * Subtracts one coordinate from another.
 *
 * @param a - Minuend coordinate.
 * @param b - Subtrahend coordinate.
 * @returns The coordinate difference `a - b`.
 *
 * @author Lukas Diegelmann
 */
export function subtractCoordinates(a: Coordinates, b: Coordinates): Coordinates {
  return { x: a.x - b.x, y: a.y - b.y };
}
