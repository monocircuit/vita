import type { EngineChronicle } from "./types";

const alignEngineChronicles = (engineChronicles: EngineChronicle[]) => {
  return engineChronicles.sort((a, b) => a.knots.start - b.knots.start);
};

export default alignEngineChronicles;
