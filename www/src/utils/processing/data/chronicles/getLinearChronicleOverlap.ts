import {
  TLinearChronicle,
  TLinearChronicleKnots,
} from "@/utils/supabase/api/tables/chronicles/_mapping";

const getLinearChronicleOverlap = (
  a: TLinearChronicle,
  b: TLinearChronicle,
): TLinearChronicleKnots | null => {
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

export default getLinearChronicleOverlap;
