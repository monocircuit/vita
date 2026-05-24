import { Coordinates } from "@/vendor/utilities/types";

/**
 * Calculates the coordinates of a point relative to a given origin.
 *
 * @param coordinates - The original coordinates of the point, containing `x` and `y` properties.
 * @param origin - The origin point to which the coordinates should be made relative,
 *                               containing `x` and `y` properties.
 * @returns An object with the `x` and `y` properties representing the relative coordinates.
 */
const getRelativeCoordinates = (coordinates: Coordinates, origin: Coordinates): Coordinates => {
  return {
    x: coordinates.x - origin.x,
    y: coordinates.y - origin.y,
  };
};

export default getRelativeCoordinates;
