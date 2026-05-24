/**
 * Calculates the coordinates of a child element relative to its parent element.
 *
 * @param child - The child HTMLDivElement whose position is being calculated.
 * @param parent - The parent HTMLDivElement to which the coordinates are relative.
 * @returns An object containing the `x` and `y` coordinates:
 *   - `x`: The horizontal distance between the left edge of the child and the left edge of the parent.
 *   - `y`: The vertical distance between the top edge of the child and the top edge of the parent.
 *
 * How it works:
 * - Uses the `getBoundingClientRect()` method to get the position of both elements relative to the viewport.
 * - Subtracts the parent's position from the child's position to calculate the relative coordinates.
 *
 * Example usage:
 * ```typescript
 * const parent = document.querySelector('.parent') as HTMLDivElement;
 * const child = document.querySelector('.child') as HTMLDivElement;
 * const coordinates = getCoordinatesRelativeToParent(child, parent);
 * console.log(coordinates); // { x: 50, y: 30 }
 * ```
 */
const getCoordinatesRelativeToParent = (child: HTMLDivElement, parent: HTMLDivElement) => {
  const childRect = child.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return {
    x: childRect.left - parentRect.left,
    y: childRect.top - parentRect.top,
  };
};

export default getCoordinatesRelativeToParent;
