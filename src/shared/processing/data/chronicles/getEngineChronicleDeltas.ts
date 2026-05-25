/**
 * TODO: At the moment all functions only work with the `x2` setting, they need to be
 *       augmented to also work with `x1` in the future.
 */

import type { EngineChronicle } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const floorToUtcDay = (value: number) => {
  if (!Number.isFinite(value)) return value;
  return Math.floor(value / MS_PER_DAY) * MS_PER_DAY;
};

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
  primary: EngineChronicle,
  secondary: EngineChronicle,
) => {
  const secondaryEnd = Number.isFinite(secondary.knots.end)
    ? floorToUtcDay(secondary.knots.end)
    : Infinity;
  const primaryStart = Number.isFinite(primary.knots.start)
    ? floorToUtcDay(primary.knots.start)
    : 0;

  return secondaryEnd - primaryStart;
};

export const getEngineChronicleRightDelta = (
  primary: EngineChronicle,
  secondary: EngineChronicle,
) => {
  const primaryEnd = Number.isFinite(primary.knots.end)
    ? primary.knots.end
    : Infinity;
  const secondaryEnd = Number.isFinite(secondary.knots.end)
    ? secondary.knots.end
    : Infinity;

  return primaryEnd - secondaryEnd;
};

const getEngineChronicleDeltas = (
  primary: EngineChronicle,
  secondary: EngineChronicle,
) => {
  return {
    left: getEngineChronicleLeftDelta(primary, secondary),
    right: getEngineChronicleRightDelta(primary, secondary),
  };
};

export default getEngineChronicleDeltas;
