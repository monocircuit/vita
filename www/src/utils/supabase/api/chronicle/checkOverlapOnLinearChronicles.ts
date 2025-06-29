import { LinearChronicle } from "@/utils/schemas/Chronicle";

const checkOverlapOnLinearChronicles = (
  linearChronicleA: LinearChronicle,
  linearChronicleB: LinearChronicle,
) => {
  if (!linearChronicleA.knots.end && linearChronicleB.knots.end) {
    return linearChronicleB.knots.end > linearChronicleA.knots.start;
  } else if (linearChronicleA.knots.end && !linearChronicleB.knots.end) {
    return linearChronicleA.knots.end > linearChronicleB.knots.start;
  } else if (!linearChronicleA.knots.end && !linearChronicleB.knots.end) {
    return true;
  }

  return (
    (linearChronicleA.knots.end as number) > linearChronicleB.knots.start ||
    (linearChronicleB.knots.end as number) > linearChronicleA.knots.start
  );
};

export default checkOverlapOnLinearChronicles;
