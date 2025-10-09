import { TLinearChronicle } from "@/utils/supabase/api/tables/chronicles/_mapping";

const alignLinearChronicles = (linearChronicles: TLinearChronicle[]) => {
  return linearChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignLinearChronicles;
