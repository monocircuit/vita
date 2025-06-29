import { LinearChronicle } from "@/utils/schemas/Chronicle";

const getLaneDeltas = (
  linearChronicleA: LinearChronicle,
  linearChronicleB: LinearChronicle,
) => {
  if (!linearChronicleB.knots.end) {
    return {
      left: Infinity,
      right: Infinity,
    };
  }

  if (!linearChronicleA.knots.end) {
    return {
      left: linearChronicleB.knots.end - linearChronicleA.knots.start,
      right: Infinity,
    };
  }

  return {
    left: linearChronicleB.knots.end - linearChronicleA.knots.start,
    right: linearChronicleA.knots.end - linearChronicleB.knots.end,
  };
};

export default getLaneDeltas;
