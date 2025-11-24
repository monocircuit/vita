import { LinearChronicle } from "@/shared/supabase/tables/chronicles/map";

/**
 * TODO: At the moment all functions only work with the `x2` setting, they need to be
 *       augmented to also work with `x1` in the future.
 */

/**
 * These functions handle the calculation of the chronicle deltas. This is to illustrate
 * the numbers these functions calculate. If we are observing two `chronicles`, each
 * function can yield four different outcomes depending on the arguments passed.
 *
 * The order of the pass chronicles matters. The first chronicles is the primary one, that
 * receives the measurement stick.
 *
 * Also the user can choose between attaching the measurement stick to `x1` or `x2`. This
 * can be useful depending on the usecase the user faces.
 *
 *                                     | <- measurement stick
 *                                     |              |
 *                      x1|------------|--------------|x2       (secondary)
 *             x1---------|------------|x2            |         (primary)
 *                        |            |              |
 *                        | LEFT DELTA | RIGHT DELTA  |
 *
 * ----> In This case the first passed chronicle is the bottom one and the user chose `x2`.
 *
 * A positive delta value means overlapping between the two chronicles, whilst a negative
 * delta is equal to no overlap. (In this case the right delta would be negative and the)
 * left delta would be positive. Keep in mind that a delta always measures the overlap!
 */
export const getLinearChronicleLeftDelta = (
  primary: LinearChronicle,
  secondary: LinearChronicle,
) => {
  if (!secondary.knots.end) {
    return Infinity;
  }

  if (!primary.knots.end) {
    return secondary.knots.end - primary.knots.start;
  }

  return secondary.knots.end - primary.knots.start;
};

export const getLinearChronicleRightDelta = (
  primary: LinearChronicle,
  secondary: LinearChronicle,
) => {
  if (!secondary.knots.end) {
    return Infinity;
  }

  if (!primary.knots.end) {
    return Infinity;
  }

  return primary.knots.end - secondary.knots.end;
};

const getLinearChronicleDeltas = (
  primary: LinearChronicle,
  secondary: LinearChronicle,
) => {
  return {
    left: getLinearChronicleLeftDelta(primary, secondary),
    right: getLinearChronicleRightDelta(primary, secondary),
  };
};

export default getLinearChronicleDeltas;
