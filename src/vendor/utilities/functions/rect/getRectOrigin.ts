/**
 * Extracts the origin (top-left corner) of a rectangle.
 *
 * @param rect - The rectangle object, typically obtained from
 *                         Element.getBoundingClientRect().
 * @returns An object containing the x and y coordinates of the rectangle's origin.
 *                   - x: The x-coordinate of the top-left corner.
 *                   - y: The y-coordinate of the top-left corner.
 */
const getRectOrigin = (rect: DOMRect) => {
  return {
    x: rect.x,
    y: rect.y,
  };
};

export default getRectOrigin;
