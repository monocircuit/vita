import {
  Chronicle,
  ChronicleOverhead,
  LinearChronicle,
} from "@/utils/schemas/Chronicle";

/**
 * @author Lukas Diegelmann
 */
const getLinearChronicles = (chronicles: (Chronicle & ChronicleOverhead)[]) => {
  const linearChronicles: (LinearChronicle & ChronicleOverhead)[] = [];
  const staticChronicles: (Chronicle & ChronicleOverhead)[] = [];

  chronicles.forEach(chronicle => {
    // Sort out all StaticChronicles
    if (chronicle.knots.length == 0) {
      staticChronicles.push(chronicle as Chronicle & ChronicleOverhead);
    }

    // Linearize the `chronicle`, that is make them definable by two knots, if they have more
    else if (chronicle.knots.length == 2) {
      // The readOwnChronicle() function guarantees that there will be at least two knots.
      // In this case the `chronicle.id` stays the same.
      linearChronicles.push({
        ...chronicle,
        knots: {
          // In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime()
          start: chronicle.knots[0],
          end: chronicle.knots[1],
        },
      });
    }

    // Also linearize the `chronicle`, if it has more than two knots, but in this case it needs
    // to be split up into multiple segments.
    else if (chronicle.knots.length > 2) {
      let i = 0;

      // Grouping the knots to pairs of two
      while (i < chronicle.knots.length - 1) {
        linearChronicles.push({
          ...chronicle,
          // Adjust id, such that the `chronicle` object still remains with an identifiable id that is unique
          id: `${chronicle.id}-${i / 2}`,
          knots: {
            // In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime()
            start: chronicle.knots[i],
            end: chronicle.knots[i + 1],
          },
        });

        i += 2;
      }

      // If there is an even number of knots add the last knot
      if (i == chronicle.knots.length - 1) {
        linearChronicles.push({
          ...chronicle,
          // Also make the `id` of the `chronicle` object identifiable and unique
          id: `${chronicle.id}-${i / 2 + 1}`,
          knots: {
            // In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime()
            start: chronicle.knots[i],
            end: Infinity,
          },
        });
      }
    }
  });

  return {
    linearChronicles,
    staticChronicles,
  };
};

export default getLinearChronicles;
