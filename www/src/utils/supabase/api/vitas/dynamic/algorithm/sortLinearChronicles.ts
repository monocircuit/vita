import { TLinearChronicle } from "@/utils/schemas/Chronicle";

const sortLinearChronicles = (linearChronicles: TLinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default sortLinearChronicles;
