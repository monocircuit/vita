import { ChronicleOverhead, LinearChronicle } from "@/utils/schemas/Chronicle";

const sortLinearChronicles = (linearlyTiedChronicles: LinearChronicle[]) => {
  return linearlyTiedChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default sortLinearChronicles;
