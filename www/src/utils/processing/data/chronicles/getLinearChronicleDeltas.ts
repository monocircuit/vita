import { LinearChronicle } from "@/utils/schemas/Chronicle";

export const getLinearChronicleLeftDelta = (
  ...linearChronicles: LinearChronicle[]
) => {
  if (!linearChronicles[1].knots.end) {
    return Infinity;
  }

  if (!linearChronicles[0].knots.end) {
    return linearChronicles[1].knots.end - linearChronicles[0].knots.start;
  }

  return linearChronicles[1].knots.end - linearChronicles[0].knots.start;
};

export const getLinearChronicleRightDelta = (
  ...linearChronicles: LinearChronicle[]
) => {
  if (!linearChronicles[1].knots.end) {
    return Infinity;
  }

  if (!linearChronicles[0].knots.end) {
    return Infinity;
  }

  return linearChronicles[0].knots.end - linearChronicles[1].knots.end;
};

const getLinearChronicleDeltas = (...linearChronicles: LinearChronicle[]) => {
  return {
    left: getLinearChronicleLeftDelta(...linearChronicles),
    right: getLinearChronicleRightDelta(...linearChronicles),
  };
};

export default getLinearChronicleDeltas;
