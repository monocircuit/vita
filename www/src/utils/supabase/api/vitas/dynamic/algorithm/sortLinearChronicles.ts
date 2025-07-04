import { LinearChronicle } from "@/utils/schemas/Chronicle";

const sortLinearChronicles = (linearChronicles: LinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default sortLinearChronicles;
