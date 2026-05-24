/**
 * Retrieves the coordinates of an HTMLDivElement relative to the viewport.
 *
 * @param element - The HTMLDivElement to get the coordinates for.
 *   If the element is `null`, the function will return default coordinates (0, 0).
 * @returns An object containing the `x` and `y` coordinates:
 *   - `x`: The horizontal position of the element's bounding box relative to the viewport.
 *   - `y`: The vertical position of the element's bounding box relative to the viewport.
 *
 * Example usage:
 * ```typescript
 * const div = document.querySelector('.my-div') as HTMLDivElement;
 * const coordinates = getElementCoordinates(div);
 * console.log(coordinates); // { x: 100, y: 200 }
 * ```
 */
const getElementCoordinates = (element: HTMLDivElement | null) => {
  if (element) {
    const RECT = element.getBoundingClientRect();

    return {
      x: RECT.x,
      y: RECT.y,
    };
  }

  return { x: 0, y: 0 };
};

export default getElementCoordinates;
