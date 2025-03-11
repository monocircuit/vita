import { Coordinates } from "../types";

const getRelativeMouseCoordinates = (
    mouseCoordinates: Coordinates,
    boundingClientRect: DOMRect
) => {
    return {
        /**
         * Calculates the position of the cursor relative to the left
         * border of the element.
         */
        x: mouseCoordinates.x - boundingClientRect.left,
        /**
         * Calculates the position of the cursor relative to the top
         * border of the element.
         */
        y: mouseCoordinates.y - boundingClientRect.top,
    };
};

export default getRelativeMouseCoordinates;
