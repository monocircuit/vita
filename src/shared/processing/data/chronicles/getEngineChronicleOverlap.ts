import { Schemas } from "@/shared/data/schemas";

const getEngineChronicleOverlap = (
  a: Schemas["Chronicles"]["Mutations"]["Engine"],
  b: Schemas["Chronicles"]["Mutations"]["Engine"],
): Schemas["Chronicles"]["Mutations"]["Engine"]["knots"] | null => {
  /**
   * Simple intervall intersection.
   */
  const start = Math.max(a.knots.start, b.knots.start);
  const end = Math.min(a.knots.end, b.knots.end);

  if (start > end) {
    /** In case start > end, there is no overlap, therefore
        the function needs to return null. */
    return null;
  }

  return { start, end };
};

export default getEngineChronicleOverlap;
