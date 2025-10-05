import { TChronicle, TLinearChronicle } from "../../../schemas/Chronicle";

const filterChronicles = (chronicles: TChronicle[]) => {
  const linearChronicles: TLinearChronicle[] = [];
  const staticChronicles: TChronicle[] = [];

  chronicles.forEach(chronicle => {
    if (chronicle.knots.length == 0) {
      /** Sort out all StaticChronicles */
      staticChronicles.push(chronicle as TChronicle);
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
          id: `${chronicle.id}-${i / 2}`,
          knots: {
            /** In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime() */
            start: chronicle.knots[i],
            end: chronicle.knots[i + 1],
          },
        });

        i += 2;
      }

      /** If there is an even number of knots add the last knot */
      if (i == chronicle.knots.length - 1) {
        linearChronicles.push({
          ...chronicle,
          id: `${chronicle.id}-${i / 2}`,
          knots: {
            /** In order to make the timestamps of the Chronicles comparable, they need to be called with .getTime() */
            start: chronicle.knots[i],
            end: Infinity,
          },
        });
      }
    }
  });

  return {
    linear: linearChronicles,
    static: staticChronicles,
  };
};

export default filterChronicles;
