import {
  Chronicle,
  ChronicleOverhead,
  LinearChronicle,
  LinearChronicleKnots,
} from "@/utils/schemas/Chronicle";
import filterChronicles from "../../data/chronicles/filterChronicles";
import {
  getLinearChronicleLeftDelta,
  getLinearChronicleRightDelta,
} from "../../data/chronicles/getLinearChronicleDeltas";
import alignLinearChronicles from "../../data/chronicles/alignLinearChronicles";
import { produce } from "immer";
import daysToMs from "@/utils/processing/data/chronicles/daysToMs";
import getLinearChronicleOverlap from "../../data/chronicles/getLinearChronicleOverlap";
import Butterfly, { ButterflyDepth } from "@/utils/structures/Butterfly";
import BipolarLinkedList, {
  BipolarLinkedListPolartity,
} from "@/utils/structures/BipolarLinkedList";

interface EngineTakeover {
  depth: ButterflyDepth;
  duration: number;
}

interface EngineProjectionSlice {
  y: number;
  knots: LinearChronicleKnots;
}

type EngineTakeoverPath = EngineTakeover[];

class Engine extends Butterfly<LinearChronicle> {
  /**
   * Space for Constants
   */
  static MANEUVER_TAKEOVER_SPACE_FALL_MIN = 20;
  static MANEUVER_TAKEOVER_SPACE_REST_MIN = 50;

  static MANEUVER_TAKEOVER_SPACE_MIN =
    this.MANEUVER_TAKEOVER_SPACE_FALL_MIN +
    this.MANEUVER_TAKEOVER_SPACE_REST_MIN;

  /**
   * State variables
   */
  private loaded = false;

  private chronicles: {
    linear: LinearChronicle[];
    static: Chronicle[];
  } = { linear: [], static: [] };

  constructor() {
    super();
  }

  /**
   * Initiates the calculations for filling the inner `ButterflyStack` with
   * the correct chronicle information.
   */
  public init(chronicles: Chronicle[]) {
    /** The `Engine` is only supposed to load once, multiple loading is not possible */
    if (this.loaded) return;
    this.loaded = true;

    /** (1) remove all chronicles without knots */
    this.chronicles = filterChronicles(chronicles);
    /** (2) sort chronicles linearly by start knot */
    this.chronicles.linear = alignLinearChronicles(this.chronicles.linear);

    console.log("sortedLinearChronicles", this.chronicles.linear);

    /** The first linear Chronicle can always fit into the neutral lane */
    this.push(0, this.chronicles.linear[0]);

    this.log();

    /** Thus we start at the second linear Chronicle in line */
    /** The .getLatestPoints() function already ensures we get minimal depth */
    for (let i = 1; i < this.chronicles.linear.length; i++) {
      const insertionChronicle = this.chronicles.linear[i];
      console.warn(insertionChronicle.title);

      /** Find `insertionDepth` */
      const insertionDepth = this.getInsertionDepth(insertionChronicle);
      console.log("insertionDepth", insertionDepth);

      /** Find `projectionData` */
      // const projectionData = this.getProjectionData(
      //   insertionChronicle,
      //   insertionDepth,
      // );

      // console.log("projectionData", projectionData);

      /** Find `takeoverLeapVerticalDepth` */
      // const takeoverPath = this.getTakeoverPath(
      //   insertionChronicle,
      //   insertionDepth,
      // );

      // console.log("takeoverDepths", takeoverPath);

      console.log("vertical insertion depth", insertionDepth.y);
      this.push(insertionDepth.y, insertionChronicle);
    }

    console.warn("RESULT");
    this.log();
  }

  /**
   * @author Lukas Diegelmann
   *
   * Checks if the `Engine` has been filled with chronicles to work with. This
   * is useful for asynchronous usage of the `Engine`, when only after some time
   * the `Engine` is ready to be used.
   */
  public isLoaded() {
    return this.loaded;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Calculates the insertion depth, i.e. the coordinates in the ButterflyStack, where
   * the Chronicle should start, before its split up and vice versa. It does this following
   * the principles of minimal depth and minimal duration weight, to ensure the best
   * possible display of the information.
   *
   * @returns ButterflyDepth (it will always find a spot to fit the chronicle in)
   */
  private getInsertionDepth(
    insertionChronicle: LinearChronicle,
  ): ButterflyDepth {
    const lastVectors = this.getLastVectors();
    let insertionDepth: ButterflyDepth | null = null;

    /**
     * Find insertion point
     * (A point where the linear Chronicle fits in, into a layer with minimal depth)
     *
     * Depth > Weight (Depth is prioritized)
     */
    for (const lastVector of lastVectors) {
      /** There is space in the layer to fit the linear Chronicle */
      if (
        getLinearChronicleLeftDelta(insertionChronicle, lastVector.value) < 0
      ) {
        /**
         * Should the found space be in the neutral layer, the insertion point is found
         * and the algorithm can break out of the loop.
         */
        if (lastVector.y == 0) {
          insertionDepth = {
            y: 0,
            x: lastVector.x + 1,
          };
          break;
        }

        /**
         * At this point the algorithm hast the absolute value of the vertical insertion
         * depth. However, in order to find if the vertical depth should be positive or negative,
         * the weight will be compared between `-verticalDepth` and `+verticalDepth`. Then the
         * sign will be placed in a way that ensures the least weight on the flaps of the stack.
         */

        /**
         * In order to save calculation power it is easier and quicker to precheck if the opposite
         * side has enough space to put the `insertionChronicle` in, because if not it has to be
         * put into the layer where the `latestPoint` current is in.
         *
         * This needs to happen in two steps: check if the opposite layer is empty, if not, check
         * the left delta to the latest point in this specific layer.
         */
        if (this.doesLevelExist(-lastVector.y)) {
          /**
           * The layer exists, thus the algorithm needs to check if there is enough space for the
           * `insertionChronicle`.
           */
          if (
            getLinearChronicleLeftDelta(insertionChronicle, lastVector.value)
          ) {
            /**
             * Now the algorithm has checked that there is in fact enough space to insert the
             * `insertionChronicle`, meaning now it makes sense to make a weight check, to see
             * in which area the `insertionChronicle` should be put.
             */
            const positiveDurationWeight = this.getDurationWeightByPolarity(
              BipolarLinkedListPolartity.POSITIVE,
            );
            const negativeDurationWeight = this.getDurationWeightByPolarity(
              BipolarLinkedListPolartity.NEGATIVE,
            );

            if (!positiveDurationWeight || !negativeDurationWeight) {
              throw Error(
                `Positive Duration Weight: ${positiveDurationWeight}, Negative Duration Weight: ${negativeDurationWeight}. Calculation Error.`,
              );
            }

            /** Weight Check, put the Chronicle in the Area with less DurationWeight */
            if (positiveDurationWeight > negativeDurationWeight) {
              /** PUT THE CHRONICLE IN THE NEGATIVE AREA */
              return {
                y: -Math.abs(lastVector.y),
                x: lastVector.x + 1,
              };
            } else {
              /** PUT THE CHRONICLE IN THE POSITIVE AREA */
              return {
                y: +Math.abs(lastVector.y),
                x: lastVector.x + 1,
              };
            }
          }
        }
      }
    }

    /** In case there was no insertion point found, create a new layer */
    if (!insertionDepth) {
      if (this.yDimensions.positive > this.yDimensions.negative) {
        /** Only insert into the negative layer if the postive layer is actually greater than the negative one */
        insertionDepth = {
          y: this.yDimensions.negative - 1,
          x: 0,
        };
      } else {
        /** Insert into the positive layer if the negative layer is greater or equal to the positive height */
        insertionDepth = {
          y: this.yDimensions.positive + 1,
          x: 0,
        };
      }
    }

    return insertionDepth;
  }

  /**
   * @author Lukas Diegelmann
   *
   * Calculates the projection data necessary to generate the takeover path. Depending on
   * the current layer the `insertionDepth` points at, the Projection happens from top to
   * bottom (positive layers) or from bottom to top (negative layers). In any case does the
   * projection point to the neutral layer.
   *
   * Example Projection: (↓: Projection follows this direction)
   *
   *    (4) x------------------------------------------ (": marks parts of the layers that
   *    (3) x""""""""""""""""                               belong to the projection)
   *    (2) x--------
   *    (1) x----------------"""""""""""""
   *    (0) x-----------------------------""""""
   */
  private getProjectionData(
    insertionChronicle: LinearChronicle,
    insertionDepth: ButterflyDepth,
  ) {
    /**
     * If the insertionDepth.y is equal to zero, then there are no layers to project
     * on, meaning there is no projection data (empty array).
     */
    if (insertionDepth.y == 0) {
      return [];
    }

    /**
     * If the `insertionDepth.y` is anything other than 0, there might be a chance
     * for projection.
     */
    const projectionSlices = this.reduceYToNeutral(
      insertionDepth.y,
      (acc, _level, y) => {
        const lastVector = this.getLastVector(y);

        if (!lastVector) {
          /** In case lastVector was not found, just skip this one */
          return acc;
        } else {
          /** In case the lastVector has been found continue. */
          console.log("iteration", lastVector.y);

          /**
           * Calculate the current overlap between the `insertion chronicle` and the
           * lastVector that is the current iteration.
           */
          const overlap = getLinearChronicleOverlap(
            insertionChronicle,
            lastVector.value,
          );

          /**
           * In case there is no overlap between the two `chronicles`, the `overlap`
           * will be `null`.
           */
          if (overlap) {
            /**
             * If there have already been projection slices collected, it is important
             * to cut the current `overlap` accordingly, since the previous slice, hides
             * parts of the current.
             */
            if (acc.length) {
              /**
               * Since the previous slice will always be the one sticking out the most,
               * it is sufficient to just look at the tail of the accumulator (i.e. the)
               * last element of it.
               *
               *            x---------------o1                      (previous slice)
               *            x---------
               *            x-----------------------o2              (current slice)
               *
               * Meaning the new slice should be between o1 and o2. Where o1 is the end
               * of the previous slice and o2 is the end of the current overlap.
               */
              overlap.start = acc[acc.length - 1].knots.end;
            }

            /**
             * In case, that after the previous slices went into consideration, the
             * overlap start is now greater than the overlap end, there will be no
             * projection slice added.
             *
             *              x---------------o1                      (previous slice)
             *              x---------
             *              x-----------o2                          (current slice)
             *
             * This condition is build in for cases like these. Where a previous slice
             * shadows the current `iterationChronicle` completely.
             */
            if (overlap.start <= overlap.end) {
              acc.push({
                knots: overlap,
                y: lastVector.y,
              });
            }
          }

          return [...acc];
        }
      },
      [] as EngineProjectionSlice[],
    );
  }

  // private getTakeoverPath(
  //   insertionChronicle: LinearChronicle,
  //   insertionDepth: ButterflyDepth,
  // ) {
  //   console.log("STARTING TAKEOVER PATH CALCULATION");
  //   /**
  //    * The `takeoverPath` will be of the form:
  //    *
  //    * { depth: { vertical: number, horizontal: number }, duration: number }[]
  //    */
  //   const takeoverPath: EngineTakeoverPath = [];

  //   /**
  //    * If the `insertionDepth` is `0` (neutral) then just add the Chronicle to the neutral layer, without any
  //    * more calculations.
  //    */
  //   if (insertionDepth.y === 0) {
  //     console.log("insertionDepth is neutral, algorithm is done, NO TAKEOVER!");
  //     return;
  //   }
  //   /**
  //    * If the `insertionDepth` has a positive `verticalDepth`, then subtract from the `verticalDepth` until
  //    * the `neutralLayer` is reached. If the insertion point has a negative vertical depth, add to the
  //    * `verticalDepth` until the `neutralLayer` is reached.
  //    */
  //   const operator = Butterfly.getVerticalDepthOperator(
  //     insertionDepth.vertical,
  //   );

  //   /**
  //    * The algorithm start at the vertical insertion depth - 1, since there is no need to look for a take over
  //    * in the layer the chronicle has already taken over.
  //    */
  //   let iteratingVerticalDepth =
  //     (insertionDepth as ButterflyStackDepth).vertical - 1;

  //   /**
  //    * Important for the stickout calculations, that are explained in more detail, when going down.
  //    */
  //   let smallestRightDelta = Infinity;
  //   let stickoutDepth: null | ButterflyStackVerticalDepth = null;

  //   let rests = 0;

  //   /**
  //    * Initiating the loop to calculate the Takeover path
  //    */
  //   do {
  //     /**
  //      * The `iteratingChronicle` is the `Chronicle` that's the last entry at the current
  //      * layer, i.e. the `Chronicle` that the algorithm needs to compare the `insertionChronicle`
  //      * to.
  //      */
  //     const iteratingChronicle = this.getLastValue(iteratingVerticalDepth);

  //     /**
  //      * The `rightDelta` between the `insertionChronicle` and the `iteratingChronicle`. The
  //      * meaning of this number can be illustrated via a quick sketch:
  //      *
  //      *                        ------------  (insertionChronicle)
  //      *              ----------------|       (iteratingChronicle)
  //      *                   left delta | right delta
  //      */
  //     const rightDelta = getLinearChronicleRightDelta(
  //       insertionChronicle,
  //       iteratingChronicle,
  //     );

  //     /**
  //      * At this point it is important to calculate the so called `stickoutChronicle`. That
  //      * is the `Chronicle` that sticks out the most out of all chronicles that are view by this
  //      * loop.
  //      *
  //      *                      ------------------------ (insertionChronicle)
  //      *               x-------------    |
  //      *               x-----------------|              (stickoutChronicle)
  //      *               x--------         |
  //      *               x-----------------|----          (iteratingChronicle)
  //      *                                 | -> available space <-
  //      *
  //      * This is important, since the available space for the takeover is dictated by this
  //      * `Chronicle`.
  //      *
  //      * The `stickoutChronicle` is the chronicle with the smallest right delta.
  //      */
  //     if (rightDelta <= smallestRightDelta) {
  //       /**
  //        * Found a `rightDelta` that is smaller than the currently smallest. Meaning the algorithm
  //        * has found a `Chronicle` that sticks out more than any previously viewed `Chronicles`.
  //        */
  //       smallestRightDelta = rightDelta;
  //       stickoutDepth = iteratingVerticalDepth;
  //     }

  //     /**
  //      * If the `smallestRightDelta` is greater than the mininum fall and rest space combined, i.e.
  //      * the minimum takeover space, then continue to calculate the maneuver.
  //      *
  //      *                       --------------------- (insertionChronicle)
  //      *            ----------------|
  //      *                            | >= Minimum Takeover Space
  //      *
  //      * If the algorithm finds such a case, it is clear that there must happen a slicing of
  //      * the `insertionChronicle`.
  //      */
  //     if (smallestRightDelta >= Engine.MANEUVER_TAKEOVER_SPACE_MIN) {
  //       takeoverPath.push({
  //         /**
  //          * The depth is exactly equal to the currently viewed depth `iteratingVerticalDepth`.
  //          * The horizontal depth can be calculated by the length of the current layer given by
  //          * the current vertical depth.
  //          */
  //         depth: {
  //           vertical: iteratingVerticalDepth,
  //           horizontal: this.getLayer(iteratingVerticalDepth).length,
  //         },
  //         /**
  //          * The rest duration is exactly equal to the previously calculated `rightDelta`,
  //          * since this marks the right overlap between `insertionChronicle` and `interatingChronicle`.
  //          */
  //         duration: rightDelta,
  //       });

  //       /** There needs to happen a slice */
  //       const stickoutChronicle = this.getLastValue(stickoutDepth);

  //       /** If the root slice has not been placed yet */
  //       if (!rests) {
  //         this.addValue(
  //           /** Slicing the insertion Chronicle */
  //           produce(insertionChronicle, draft => {
  //             draft.knots.end = stickoutChronicle.knots.end;
  //           }),
  //           insertionDepth.vertical,
  //         );
  //       }

  //       /** Place the insertion chronicle on the rest area */
  //       this.addValue(
  //         produce(insertionChronicle, draft => {
  //           draft.knots.start =
  //             stickoutChronicle.knots.end +
  //             daysToMs(Engine.MANEUVER_TAKEOVER_SPACE_FALL_MIN);
  //           draft.knots.end = iteratingChronicle.knots.end;
  //         }),
  //         iteratingVerticalDepth,
  //       );

  //       rests++;
  //     }

  //     if (rightDelta <= smallestRightDelta) {
  //       smallestRightDelta = rightDelta;
  //       stickoutDepth = iteratingVerticalDepth;
  //     }

  //     iteratingVerticalDepth = operator(iteratingVerticalDepth);
  //   } while (iteratingVerticalDepth !== 0);

  //   if (!rests) {
  //     this.addValue(insertionChronicle, insertionDepth.vertical);
  //   }
  // }

  private getDurationWeightByLevel(y: number): number | undefined {
    const level = this.getLevel(y);

    if (level) {
      let acc = 0;
      for (const cell of level) {
        acc += cell.value.knots.end - cell.value.knots.start;
      }
      return acc;
    }
  }

  private getDurationWeightByPolarity(polarity: BipolarLinkedListPolartity) {
    switch (polarity) {
      case BipolarLinkedListPolartity.POSITIVE:
        return this.getAllPositive().reduce((acc, _layer, index) => {
          const dw = this.getDurationWeightByLevel(index + 1);
          if (dw) return acc + dw;
          return acc;
        }, 0);
      case BipolarLinkedListPolartity.NEGATIVE:
        return this.getAllNegative().reduce((acc, _layer, index) => {
          const dw = this.getDurationWeightByLevel(index + 1);
          if (dw) return acc + dw;
          return acc;
        }, 0);
      case BipolarLinkedListPolartity.NEUTRAL:
        return this.getDurationWeightByLevel(0);
    }
  }

  /**
   * @author ChatGPT5
   *
   * Logs all levels of the butterfly stack to the console.
   *
   * This variant assumes Value = LinearChronicle.
   * For each entry it prints:
   *   x=<index>: <title> | start=<date>, end=<date>
   *
   * Levels (y) are printed in the store's default order (0, +1, -1, +2, -2, …).
   * Within each level, values are printed left-to-right (… -2, -1, 0, 1, 2, …).
   */
  public log() {
    for (const levelNode of this.iterateY()) {
      const level = levelNode.value;
      const y = levelNode.index;
      // Collect items left-to-right
      const items: Array<{ x: number; v: LinearChronicle }> = [];

      // Negative side … -2, -1, 0
      for (const node of level.iterateNeutralToNegative()) {
        items.unshift({ x: node.index, v: node.value });
      }

      // Positive side 1, 2, …
      for (const node of level.iterateNeutralToPositive()) {
        if (node.index !== 0) items.push({ x: node.index, v: node.value });
      }

      console.group(`y=${y}`);
      for (const { x, v } of items) {
        // Assume v is a LinearChronicle
        const lc = v as any as {
          title: string;
          knots: { start: number; end: number };
        };

        const fmt = (ms: number) =>
          ms === Infinity ? "∞" : new Date(ms).toISOString().slice(0, 10);

        const start = fmt(lc.knots.start);
        const end = fmt(lc.knots.end);

        console.log(`x=${x}: ${lc.title} | start=${start}, end=${end}`);
      }
      console.groupEnd();
    }
  }
}

export default Engine;
