import { Coordinates } from "@/vendor/utilities/types";

/**
 * Finds the closest point on a rectangle to a given point.
 *
 * @param rect - The rectangle object, typically obtained from
 *                         Element.getBoundingClientRect().
 * @param point - The point to which the closest position on the rectangle
 *                              should be determined. The point must include `x` and `y` properties.
 * @returns An object containing the x and y coordinates of the closest point on the rectangle.
 *                   - x: The x-coordinate of the closest point.
 *                   - y: The y-coordinate of the closest point.
 */
const getClosestPointOnRect = (rect: DOMRect, point: Coordinates) => {
  const closestX = Math.max(rect.left, Math.min(point.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(point.y, rect.bottom));

  return { x: closestX, y: closestY };
};

export default getClosestPointOnRect;
