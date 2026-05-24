/**
 * Calculates the center point of a rectangle.
 *
 * @param rect - The rectangle object, typically obtained from
 *                         Element.getBoundingClientRect().
 * @returns An object containing the x and y coordinates of the rectangle's center.
 *                   - x: The x-coordinate of the center.
 *                   - y: The y-coordinate of the center.
 */
const getCenterOnRect = (rect: DOMRect) => {
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  return { x, y };
};

export default getCenterOnRect;
