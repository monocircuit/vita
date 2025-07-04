import { LinearChronicle } from "@/utils/schemas/Chronicle";

const getTakeoverAvailableSpace = (
  linearChronicleTop: LinearChronicle,
  linearChronicleBottom: LinearChronicle,
) => {
  return linearChronicleBottom.knots.end - linearChronicleTop.knots.end;
};

export default getTakeoverAvailableSpace;
