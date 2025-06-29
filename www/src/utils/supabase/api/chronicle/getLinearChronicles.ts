import {
  Chronicle,
  ChronicleOverhead,
  LinearChronicle,
} from "@/utils/schemas/Chronicle";

const getLinearChronicles = (chronicles: (Chronicle & ChronicleOverhead)[]) => {
  const linearChronicles: (LinearChronicle & ChronicleOverhead)[] = [];
  const staticChronicles: (Chronicle & ChronicleOverhead)[] = [];

  chronicles.forEach(chronicle => {
    if (!chronicle.knots) {
      /** Sort out all StaticChronicles */
      staticChronicles.push(chronicle as Chronicle & ChronicleOverhead);
    } else if (chronicle.knots.length == 2) {
      /** Linearize all Chronicles, that is make them definable by two knots, if they have more */
      /** The readOwnChronicle() function guarantees that there will be at least two knots */
      linearChronicles.push({
        ...chronicle,
        knots: {
          /** In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime() */
          start: chronicle.knots[0],
          end: chronicle.knots[1],
        },
      });
    } else if (chronicle.knots.length > 2) {
      /** In case that there are more than two knots, split the Chronicle up into multiple chronicles  */
      let i = 0;

      /** Grouping the knots to pairs of two */
      while (i < chronicle.knots.length - 1) {
        linearChronicles.push({
          ...chronicle,
          knots: {
            /** In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime() */
            start: chronicle.knots[i],
            end: chronicle.knots[i + 1],
          },
        });

        i += 2;
      }
    }
  });

  return {
    linearChronicles,
    staticChronicles,
  };
};

export default getLinearChronicles;
