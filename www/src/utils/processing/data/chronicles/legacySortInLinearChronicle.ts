import { ChronicleOverhead, LinearChronicle } from "@/utils/schemas/Chronicle";
import alignLinearChronicles from "./alignLinearChronicles";
import LayeredTree, {
  LayeredTreeOrientation,
} from "@/utils/structures/LayeredTree";
import checkLinearChronicleOverlap from "./checkLinearChronicleOverlap";
import getLinearChronicleDeltas from "./getLinearChronicleDeltas";
import { VITA_DYNAMIC_MANEUVERS_TAKEOVER_MIN_SPACE } from "../../../supabase/api/vitas/dynamic/dynamicVitaConstants";

const sortInLinearChronicle = (
  linearChronicles: (LinearChronicle & ChronicleOverhead)[],
) => {
  const sortedLinearChronicles = alignLinearChronicles(linearChronicles);

  const layeredTree = new LayeredTree<LinearChronicle & ChronicleOverhead>({
    embeddedSortIn(context, value, comparator) {
      const layeredValues = context.getValues();

      for (let i = 0; i < layeredValues.length; i++) {
        const currentLayeredValue = layeredValues[i];
        const previousLayeredValue = i > 0 ? layeredValues[i - 1] : null;

        if (!previousLayeredValue) {
          /** If there is no previousLayeredValue, its the first to sort it, so its easy */
          context.addValue(currentLayeredValue, LayeredTreeOrientation.NEUTRAL);
        } else {
          /** Both current and previous Chronicles are finite */
          if (currentLayeredValue.knots.end && previousLayeredValue.knots.end) {
            const laneDeltas = getLinearChronicleDeltas(
              currentLayeredValue,
              previousLayeredValue,
            );

            /** If the delta is greater than zero, we need to sort in the value partially into a child */
            if (laneDeltas.left > 0) {
              /** In order to know if there needs to happen a takeover we need to compare the right delta
                  with the minimal takeover space */
              if (
                laneDeltas.right >= VITA_DYNAMIC_MANEUVERS_TAKEOVER_MIN_SPACE
              ) {
                /** Now there needs to happen a takeover */
              } else {
                /** Here no takeover needs to happen and the child is just passed into a child */
                context.balanceValueOnChildren(currentLayeredValue);
              }

              /** In order to know how far we need to sort it into the child layer we need to take a look
              at the right delta */
            }
          }
        }
      }

      return context;
    },
  });
};
