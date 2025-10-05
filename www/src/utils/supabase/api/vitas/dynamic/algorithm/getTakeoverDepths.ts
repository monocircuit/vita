import { TLinearChronicle } from "@/utils/schemas/Chronicle";
import Butterfly from "@/utils/structures/ButterflyStack";
import { ButterflyStackDepth } from "@/utils/structures/ButterflyStack.d";
import { getLinearChronicleRightDelta } from "../../../../../processing/data/chronicles/getLinearChronicleDeltas";
import { VITA_DYNAMIC_MANEUVERS_TAKEOVER_MIN_SPACE } from "../dynamicVitaConstants";

/**
 * `getTakeoverDepths` is a non invasive function, meaning it does not alter the
 * contents of the passed `ButterflyStack`.
 */
const getTakeoverDepths = (
  insertionChronicle: TLinearChronicle,
  insertionDepth: ButterflyStackDepth,
  butterflyStack: Butterfly<TLinearChronicle>,
) => {
  /**
   * If the `insertionDepth` has a positive `verticalDepth`, then subtract from the `verticalDepth` until
   * the `neutralLayer` is reached. If the insertion point has a negative vertical depth, add to the
   * `verticalDepth` until the `neutralLayer` is reached.
   */
  const operator = Butterfly.getVerticalDepthOperator(insertionDepth.vertical);

  let iteratingVerticalDepth = (insertionDepth as ButterflyStackDepth).vertical;
  let takeoverStickoutDepth = iteratingVerticalDepth;
  let smallestRightDelta = 0;

  while (iteratingVerticalDepth > 0) {
    const rightDelta = getLinearChronicleRightDelta(
      insertionChronicle,
      butterflyStack.getValue(
        iteratingVerticalDepth,
        butterflyStack.getLayer(iteratingVerticalDepth).length,
      ),
    );

    if (rightDelta >= VITA_DYNAMIC_MANEUVERS_TAKEOVER_MIN_SPACE) {
      /** If there is enough space to make a Takeover, look if the Chronicle can make more Takeovers */
      iteratingVerticalDepth = operator(iteratingVerticalDepth);

      if (rightDelta <= smallestRightDelta) {
        smallestRightDelta = rightDelta;
        takeoverStickoutDepth = iteratingVerticalDepth;
      }
    } else {
      /** The first layer where there is not enough space for a Takeover brings this loop to an end */
      break;
    }
  }

  return {
    start: insertionDepth.vertical,
    end: iteratingVerticalDepth,
    stickout: takeoverStickoutDepth,
  };
};

export default getTakeoverDepths;
