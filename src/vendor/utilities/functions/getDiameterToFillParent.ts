/**
 * Calculates the diameter of a circle required to completely fill a parent rectangle.
 *
 * @param parent - The parent HTML element whose bounding rectangle is used
 *                 to calculate the required circle diameter.
 * @returns The diameter of the circle needed to cover the parent rectangle from any position.
 */
const getDiameterToFillParent = (parent: HTMLDivElement): number => {
  const parentRect = parent.getBoundingClientRect();
  const parentWidth = parentRect.width;
  const parentHeight = parentRect.height;

  const maxDiagonal = Math.sqrt(Math.pow(parentWidth, 2) + Math.pow(parentHeight, 2));

  return maxDiagonal * 2.5;
};

export default getDiameterToFillParent;
