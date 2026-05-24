/**
 * Calculates a rectangle's position and dimensions relative to another rectangle.
 *
 * @param rect - The rectangle whose relative position and dimensions will be calculated.
 * @param relativeTo - The rectangle that serves as the reference point for the relative calculation.
 * @returns A DOMRect-like object representing the relative position and dimensions of the input rectangle.
 *          The object includes properties: `top`, `left`, `bottom`, `right`, `width`, `height`, `x`, `y`,
 *          and a `toJSON` method for JSON serialization.
 */
const getRelativeRect = (rect: DOMRect, relativeTo: DOMRect): DOMRect => {
  const relativeRect = {
    top: rect.top - relativeTo.top,
    left: rect.left - relativeTo.left,
    bottom: rect.bottom - relativeTo.top,
    right: rect.right - relativeTo.left,
    width: rect.width,
    height: rect.height,
    x: rect.x - relativeTo.x,
    y: rect.y - relativeTo.y,

    toJSON() {
      return {
        top: this.top,
        left: this.left,
        bottom: this.bottom,
        right: this.right,
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
      };
    },
  };

  return relativeRect;
};

export default getRelativeRect;
