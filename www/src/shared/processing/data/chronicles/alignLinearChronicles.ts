import { LinearChronicle } from "@/shared/supabase/tables/chronicles/map";

const alignLinearChronicles = (linearChronicles: LinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignLinearChronicles;
