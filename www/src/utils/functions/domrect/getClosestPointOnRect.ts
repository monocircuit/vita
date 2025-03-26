import { Coordinates } from "../../types/types";

const getClosestPointOnRect = (rect: DOMRect, point: Coordinates) => {
    // Begrenze die x-Koordinate auf die Rechteckgrenzen
    const closestX = Math.max(rect.left, Math.min(point.x, rect.right));

    // Begrenze die y-Koordinate auf die Rechteckgrenzen
    const closestY = Math.max(rect.top, Math.min(point.y, rect.bottom));

    return { x: closestX, y: closestY };
};

export default getClosestPointOnRect;
