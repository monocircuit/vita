import { LinearChronicle } from "@/utils/schemas/Chronicle";
import ButterflyStack from "@/utils/structures/ButterflyStack";
import { ButterflyStackDepth } from "@/utils/structures/ButterflyStack.d";
import { getLinearChronicleLeftDelta } from "../../../../../processing/data/chronicles/getLinearChronicleDeltas";

/**
 * @author Lukas Diegelmann
 *
 * `getInsertionDepth` will try to find an insertion depth (`ButterflyStackDepth`) that
 * tries to minimize the depth and weight. It does this based on a `ButterflyStack` and
 * a `insertionChronicle` that is a Chronicle that the algorithm tries to insert into
 * the `ButterflyStack`.
 *
 * This function is non invasive, meaning that it does alter the `ButterflyStack` it only
 * reads from it.
 */
function getInsertionDepth(
  insertionChronicle: LinearChronicle,
  butterflyStack: ButterflyStack<LinearChronicle>,
) {
  const latestPoints = butterflyStack.getLastPoints();
  let insertionDepth: ButterflyStackDepth | null = null;

  /** Find insertion point 
      (A point where the linear Chronicle fits in, is closest to the center and into a layer with minimal depth) */
  for (let j = 0; j < latestPoints.length; j++) {
    const latestPoint = latestPoints[j];

    /** There is space in the layer to fit the linear Chronicle */
    if (
      getLinearChronicleLeftDelta(insertionChronicle, latestPoint.value) < 0
    ) {
      /** Do weight check */
      /** For the weight check we do not need points, depth is sufficient */
      insertionDepth = butterflyStack.pointToDepth(latestPoint);
      for (
        let k = j;
        k < j + Math.pow(2, (insertionDepth as ButterflyStackDepth).vertical);
        k++
      ) {
        const currentVerticalDepth = ButterflyStack.alternateVerticalDepth(k);

        if (
          butterflyStack.getLayerWeight(
            (insertionDepth as ButterflyStackDepth).vertical,
          ) < butterflyStack.getLayerWeight(currentVerticalDepth)
        ) {
          insertionDepth = {
            vertical: currentVerticalDepth,
            horizontal: butterflyStack.getLayer(currentVerticalDepth).length,
          };
        }
      }

      /** Cancel the outer loop, because the algorithm found an insertion point */
      break;
    }

    if (!insertionDepth) {
      /** In case there was no insertion point found, create a new layer */
      const layerHeight = butterflyStack.getLayerHeight();

      if (layerHeight.positive > layerHeight.negative) {
        /** Only insert into the negative layer if the postive layer is actually greater than the negative one */
        insertionDepth = {
          vertical: layerHeight.negative - 1,
          horizontal: 0,
        };
      } else {
        /** Insert into the positive layer if the negative layer is greater or equal to the positive height */
        insertionDepth = {
          vertical: layerHeight.positive + 1,
          horizontal: 0,
        };
      }
    }
  }

  return insertionDepth as ButterflyStackDepth;
}

export default getInsertionDepth;
