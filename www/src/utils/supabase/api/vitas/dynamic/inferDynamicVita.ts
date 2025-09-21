import {
  Chronicle,
  ChronicleOverhead,
  LinearChronicle,
} from "@/utils/schemas/Chronicle";
import { createClient } from "@/utils/supabase/client";
import getLinearChronicles from "./algorithm/getLinearChronicles";
import LayeredTree from "@/utils/structures/LayeredTree";
import checkLinearChronicleOverlap from "../../../../processing/data/chronicles/checkLinearChronicleOverlap";
import ButterflyStack from "@/utils/structures/ButterflyStack";
import getInsertionDepth from "./algorithm/getInsertionDepth";
import getTakeoverDepths from "./algorithm/getTakeoverDepths";
import alignLinearChronicles from "./sortInLinearChronicles";
import Engine from "@/utils/processing/engines/dynamic/Engine";

// const sortLinearChronicles = (
//   linearlyTiedChronicles: (LinearChronicle & ChronicleOverhead)[],
// ) => {
//   const sortedLinearlyTiedChronicles = linearlyTiedChronicles.sort(
//     (a, b) => a.knots.start - b.knots.start,
//   );

//   const stack = new ButterflyStack();
//   stack.getValue(1, 2);

//   /**
//    * Initializing the data structure to store the connections in.
//    *
//    * Each tree leaf is a lane in the vita display. This means that each
//    * leaf can contain multiple linearlyTiedChronicles.
//    */
//   const layeredTree = new LayeredTree<LinearChronicle & ChronicleOverhead>({
//     embeddedSortIn: (context, value, comparator) => {
//       const values = context.getValues();

//       for (let i = 0; i < values.length; i++) {
//         const isOverlapping = checkOverlapOnLinearChronicles(value, values[i]);

//         if (isOverlapping) {
//         }
//       }

//       return context;
//     },
//   });

//   console.log("linear chronicles", linearlyTiedChronicles);

//   /** Go through every linear chronicle and sort it into the data structure */
//   sortedLinearlyTiedChronicles.forEach(sortedLinearlyTiedChronicle =>
//     layeredTree.sortIn(sortedLinearlyTiedChronicle, (value, layeredValue) => {
//       console.log("comparator", value.id, layeredValue.id);
//       console.log("comparator knots", value.knots, layeredValue.knots);

//       /** This is the comparator function that needs to check if there is enough
//             space to fit the value into one layer */

//       /** In case both values have no end (go until present) */
//       if (!value.knots.end && !layeredValue.knots.end) {
//         return false;
//       }

//       /** In case the layered value has no end, but the value has one */
//       if (value.knots.end && !layeredValue.knots.end) {
//         return value.knots.end <= layeredValue.knots.start;
//       }

//       /** In case the value has no end, but the layered value does */
//       if (!value.knots.end && layeredValue.knots.end) {
//         return layeredValue.knots.end <= value.knots.start;
//       }

//       console.log("comparator last");
//       /** In case both values have an end */
//       return !(
//         value.knots.start < (layeredValue.knots.end as number) ||
//         layeredValue.knots.start > (value.knots.end as number)
//       );
//     }),
//   );

//   return layeredTree;
// };

const storeLinearChronicles = (linearChronicles: LinearChronicle[]) => {
  const sortedLinearChronicles = alignLinearChronicles(linearChronicles);
  const butterflyStack = new ButterflyStack<LinearChronicle>();

  console.log("sortedLinearChronicles", sortedLinearChronicles);

  /** The first linear Chronicle can always fit into the neutral lane */
  butterflyStack.addValue(sortedLinearChronicles[0], 0);

  /** Thus we start at the second linear Chronicle in line */
  /** The .getLatestPoints() function already ensures we get minimal depth */
  for (let i = 1; i < sortedLinearChronicles.length; i++) {
    const insertionChronicle = sortedLinearChronicles[i];
    const latestPoints = butterflyStack.getLastPoints();

    console.warn(insertionChronicle.title);
    console.log("latestPoints", latestPoints);

    /** Find `insertionDepth` */
    const insertionDepth = getInsertionDepth(
      insertionChronicle,
      butterflyStack,
    );

    console.log("insertionDepth", insertionDepth);

    /** Find `takeoverLeapVerticalDepth` */
    const takeoverDepths = getTakeoverDepths(
      insertionChronicle,
      insertionDepth,
      butterflyStack,
    );

    console.log("takeoverDepths", takeoverDepths);
  }
};

async function inferDynamicVita(chronicles: (Chronicle & ChronicleOverhead)[]) {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const engine = new Engine(chronicles);

  // const { linearChronicles, staticChronicles } =
  //   getLinearChronicles(chronicles);

  // storeLinearChronicles(linearChronicles);
}

export default inferDynamicVita;
