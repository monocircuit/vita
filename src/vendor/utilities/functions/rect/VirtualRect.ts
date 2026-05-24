import { Coordinates } from "@/vendor/utilities/types";

/**
 * A class representing a virtual rectangle, mimicking the behavior of a DOMRect object,
 * with added mutability for its properties.
 */
class VirtualRect {
  private store;

  /**
   * Initializes a new instance of the VirtualRect class.
   *
   * @param rect - The rectangle object to initialize the VirtualRect with.
   *               The properties `x`, `y`, `height`, and `width` are extracted from the DOMRect.
   */
  constructor(rect: DOMRect) {
    this.store = {
      x: rect.x,
      y: rect.y,
      height: rect.height,
      width: rect.width,
    };
  }

  get x() {
    return this.store.x;
  }

  get y() {
    return this.store.y;
  }

  get left() {
    return this.store.x;
  }

  get right() {
    return this.store.x + this.store.width;
  }

  get top() {
    return this.store.y;
  }

  get bottom() {
    return this.store.y + this.store.height;
  }

  get height() {
    return this.store.height;
  }

  get width() {
    return this.store.width;
  }

  set x(x: number) {
    this.store.x = x;
  }

  set y(y: number) {
    this.store.y = y;
  }

  set height(height: number) {
    this.store.height = height;
  }

  set width(width: number) {
    this.store.width = width;
  }

  /**
   * Sets the position of the rectangle by updating its `x` and `y` coordinates.
   *
   * @param position - The new position of the rectangle, containing `x` and `y` properties.
   */
  set position(position: Coordinates) {
    this.store.x = position.x;
    this.store.y = position.y;
  }

  /**
   * Gets the current position of the rectangle as an object containing `x` and `y` properties.
   *
   * @returns The current position of the rectangle.
   */
  get position() {
    return {
      x: this.store.x,
      y: this.store.y,
    };
  }
}

export default VirtualRect;
