/**
 * TODO: At the moment all functions only work with the `x2` setting, they need to be
 *       augmented to also work with `x1` in the future.
 */

import { Schemas } from "@/shared/supabase/schemas";

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
export const getEngineChronicleLeftDelta = (
  primary: Schemas["Chronicles"]["Mutations"]["Engine"],
  secondary: Schemas["Chronicles"]["Mutations"]["Engine"],
) => {
  if (!secondary.knots.end) {
    return Infinity;
  }

  if (!primary.knots.end) {
    return secondary.knots.end - primary.knots.start;
  }

  return secondary.knots.end - primary.knots.start;
};

export const getEngineChronicleRightDelta = (
  primary: Schemas["Chronicles"]["Mutations"]["Engine"],
  secondary: Schemas["Chronicles"]["Mutations"]["Engine"],
) => {
  if (!secondary.knots.end) {
    return Infinity;
  }

  if (!primary.knots.end) {
    return Infinity;
  }

  return primary.knots.end - secondary.knots.end;
};

const getEngineChronicleDeltas = (
  primary: Schemas["Chronicles"]["Mutations"]["Engine"],
  secondary: Schemas["Chronicles"]["Mutations"]["Engine"],
) => {
  return {
    left: getEngineChronicleLeftDelta(primary, secondary),
    right: getEngineChronicleRightDelta(primary, secondary),
  };
};

export default getEngineChronicleDeltas;
