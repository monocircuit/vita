import { LinearChronicle } from "@/utils/schemas/Chronicle";
import alignLinearChronicles from "../../../../processing/data/chronicles/alignLinearChronicles";
import LayeredTree from "@/utils/structures/LayeredTree";
import getLinearChronicleDeltas from "../../../../processing/data/chronicles/getLinearChronicleDeltas";

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
  const sortedLinearChronicles = alignLinearChronicles(linearChronicles);

  const layeredTree = new LayeredTree<LinearChronicle>({
    embeddedSortIn: (context, chronicle, comparator) => {
      const flattened = context.flattened;
      let cachedIndex = 0;

      for (let i = 0; i < flattened.length; i++) {
        const currentDeltas = getLinearChronicleDeltas(
          chronicle,
          flattened[i].lastValue,
        );
        const winningDeltas = getLinearChronicleDeltas(
          chronicle,
          flattened[cachedIndex].lastValue,
        );
      }

      flattened.forEach((currentLayeredTree, i) => {
        const currentDeltas = getLinearChronicleDeltas(
          chronicle,
          currentLayeredTree.lastValue,
        );
        const winningDeltas = getLinearChronicleDeltas(
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

export default alignLinearChronicles;
