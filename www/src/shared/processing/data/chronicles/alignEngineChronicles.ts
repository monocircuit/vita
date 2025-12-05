import { Schemas } from "@/shared/supabase/schemas";

const alignEngineChronicles = (
  engineChronicles: Schemas["Chronicles"]["Mutations"]["Engine"][],
) => {
  return engineChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignEngineChronicles;
