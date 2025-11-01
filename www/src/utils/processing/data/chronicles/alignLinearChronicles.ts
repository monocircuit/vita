import { TLinearChronicle } from "@/utils/supabase/tables/chronicles/mapping";

const alignLinearChronicles = (linearChronicles: TLinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignLinearChronicles;
