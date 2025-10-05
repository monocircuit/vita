import {
  TChronicle,
  TChronicleOverhead,
  TLinearChronicle,
} from "@/utils/schemas/Chronicle";
import { createClient } from "@/utils/supabase/client";
import getLinearChronicles from "../vitas/dynamic/algorithm/getLinearChronicles";
import LayeredTree from "@/utils/structures/LayeredTree";

const sortLinearlyTiedChronicles = (
  linearlyTiedChronicles: (TLinearChronicle & TChronicleOverhead)[],
) => {
  const sortedLinearlyTiedChronicles = linearlyTiedChronicles.sort(
    (a, b) => a.knots.start - b.knots.start,
  );

  /**
   * Initializing the data structure to store the connections in.
   *
   * Each tree leaf is a lane in the vita display. This means that each
   * leaf can contain multiple linearlyTiedChronicles.
   */
  const layeredTree = new LayeredTree<
    TLinearChronicle & TChronicleOverhead
  >();

  console.log("linear chronicles", linearlyTiedChronicles);

  /** Go through every linear chronicle and sort it into the data structure */
  sortedLinearlyTiedChronicles.forEach(sortedLinearlyTiedChronicle =>
    layeredTree.embeddedSortIn(sortedLinearlyTiedChronicle, (value, layeredValue) => {
      console.log("comparator", value.id, layeredValue.id);
      console.log("comparator knots", value.knots, layeredValue.knots);

      /** This is the comparator function that needs to check if there is enough
          space to fit the value into one layer */

      /** In case both values have no end (go until present) */
      if (!value.knots.end && !layeredValue.knots.end) {
        return false;
      }

      /** In case the layered value has no end, but the value has one */
      if (value.knots.end && !layeredValue.knots.end) {
        return value.knots.end <= layeredValue.knots.start;
      }

      /** In case the value has no end, but the layered value does */
      if (!value.knots.end && layeredValue.knots.end) {
        return layeredValue.knots.end <= value.knots.start;
      }

      console.log("comparator last");
      /** In case both values have an end */
      return !(
        value.knots.start < (layeredValue.knots.end as number) ||
        layeredValue.knots.start > (value.knots.end as number)
      );
    }),
  );

  return layeredTree;
};

async function createInferredChronicleRelations(
  chronicles: (TChronicle & TChronicleOverhead)[],
) {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { linearlyTiedChronicles, untiedChronicles } =
    getLinearChronicles(chronicles);
  const sortedChronicles = sortLinearlyTiedChronicles(linearlyTiedChronicles);

  console.log(sortedChronicles);
}

export default createInferredChronicleRelations;
