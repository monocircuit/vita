import { LinearChronicle } from "@/utils/schemas/Chronicle";
import sortLinearChronicles from "../../chronicle/sortLinearChronicles";
import LayeredTree from "@/utils/structures/LayeredTree";
import getLaneDeltas from "./getLaneDeltas";

const findLatestChronicle = (layeredTrees: LayeredTree<LinearChronicle>[]) => {
  let latestChronicle = layeredTrees[0].lastValue;

  for (let i = 1; i < layeredTrees.length; i++) {
    if (latestChronicle.knots.end < layeredTrees[i].lastValue.knots.end) {
      latestChronicle = layeredTrees[i].lastValue;
    }
  }

  return latestChronicle;
};

const sortInLinearChronicle = (linearChronicles: LinearChronicle[]) => {
  const sortedLinearChronicles = sortLinearChronicles(linearChronicles);

  const layeredTree = new LayeredTree<LinearChronicle>({
    embeddedSortIn: (context, chronicle, comparator) => {
      const flattened = context.flattened;
      let cachedIndex = 0;

      flattened.forEach((currentLayeredTree, i) => {
        const currentDeltas = getLaneDeltas(
          chronicle,
          currentLayeredTree.lastValue,
        );
        const winningDeltas = getLaneDeltas(
          chronicle,
          flattened[cachedIndex].lastValue,
        );

        if (currentDeltas.left < 0) {
          /** Chronicle fits into the current layer, meaning it is an contestant for a placement */
          if (
            flattened[cachedIndex].getDepth() > currentLayeredTree.getDepth()
          ) {
            /** found a layer with less depth */
            cachedIndex = i;
          }
        }
      });

      const latestChronicle = findLatestChronicle(flattened);

      for (let i = 0; i < flattened.length; i++) {
        const latestChronicle = flattened[i].lastValue;
      }

      return context;
    },
  });
};
