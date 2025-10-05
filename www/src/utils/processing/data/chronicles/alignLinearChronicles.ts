import { TLinearChronicle } from "@/utils/schemas/Chronicle";

const alignLinearChronicles = (linearChronicles: TLinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignLinearChronicles;
