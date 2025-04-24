import Two from "two.js";
import { Line } from "two.js/src/shapes/line";

/**
 * Shortens a line by adjusting its end coordinate.
 *
 * @param {Line} line - The line to be shortened, must be a `Two.Line` object.
 * @param {number} length - The new length the line should have.
 */
const shortenLine = (line: Line, length: number) => {
    // Extract the start and end anchors of the line
    const [startAnchor, endAnchor] = line.vertices;

    // Convert the anchors into vector objects for calculations
    const startVector = new Two.Vector(startAnchor.x, startAnchor.y);
    const endVector = new Two.Vector(endAnchor.x, endAnchor.y);

    // Calculate the vector from the start to the end of the line
    const vector = Two.Vector.subtract(endVector, startVector);

    // Compute the current length of the line
    const vectorLength = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

    // If the length is zero, exit as no adjustment can be made
    if (vectorLength == 0) return;

    // Normalize the vector (convert it to a unit vector)
    vector.divideScalar(vectorLength);

    // Scale the unit vector to the desired length
    vector.multiplyScalar(length);

    // Add the scaled vector to the start vector to compute the new end point
    vector.add(startVector);

    // Update the end anchor's coordinates to the new position
    endAnchor.x = vector.x;
    endAnchor.y = vector.y;
};

export default shortenLine;
