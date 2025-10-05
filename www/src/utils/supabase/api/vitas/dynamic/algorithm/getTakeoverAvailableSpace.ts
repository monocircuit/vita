import { TLinearChronicle } from "@/utils/schemas/Chronicle";

const getTakeoverAvailableSpace = (
  linearChronicleTop: TLinearChronicle,
  linearChronicleBottom: TLinearChronicle,
) => {
  return linearChronicleBottom.knots.end - linearChronicleTop.knots.end;
};

export default getTakeoverAvailableSpace;
