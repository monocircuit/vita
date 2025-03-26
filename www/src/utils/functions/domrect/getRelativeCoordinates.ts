import { Coordinates } from "@/utils/types/types";

const getRelativeCoordinates = (coordinates: Coordinates, origin: Coordinates): Coordinates => {
    return {
        x: coordinates.x - origin.x,
        y: coordinates.y - origin.y,
    };
};

export default getRelativeCoordinates;
