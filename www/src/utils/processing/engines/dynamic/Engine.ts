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
import Butterfly, {
  ButterflyCell,
  ButterflyDepth,
} from "@/utils/structures/Butterfly";
import BipolarDoublyLinkedList, {
  BipolarLinkedListPolartity,
} from "@/utils/structures/BipolarDoublyLinkedList";

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

    console.log("linear chronicles", this.chronicles.linear);

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

      /** Find `TakeoverPath` */
      const takeoverPath = this.getTakeoverPath(
        insertionChronicle,
        insertionDepth,
      );

      /** Find `takeoverLeapVerticalDepth` */
      // const takeoverPath = this.getTakeoverPath(
      //   insertionChronicle,
      //   insertionDepth,
      // );

      // console.log("takeoverDepths", takeoverPath);

      console.log("vertical insertion depth", insertionDepth.y);
      // this.push(insertionDepth.y, insertionChronicle);
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
      console.log(lastVector);
      /** There is space in the layer to fit the linear Chronicle */
      if (
        getLinearChronicleLeftDelta(insertionChronicle, lastVector.value.$) < 0
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
            getLinearChronicleLeftDelta(insertionChronicle, lastVector.value.$)
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
   * Compute the cumulative projection of chronicles across Y-levels,
   * starting from the given level and reducing step by step toward neutral (0).
   *
   * The algorithm uses {@link reduceYToNeutral} with {@link stepTowardZero}
   * to walk level by level back toward the origin. At each step it looks at
   * the `positiveTail` of the current level (i.e. the chronicle at the far
   * right end of that level).
   *
   * For each level:
   * - If the last chronicle in the accumulator already extends beyond (or
   *   completely covers) the current chronicle, then the current chronicle
   *   is skipped.
   *
   * - Otherwise, if there is a previous slice, its `end` is adjusted to end
   *   where the current chronicle ends, ensuring continuity of the projection.
   *
   * - A new slice is then pushed into the accumulator, starting at the end
   *   of the current chronicle and extending to `Infinity`. This represents
   *   the "open projection" continuing from that point onward.
   *
   * @param y - The Y-level index from which to start the projection.
   *            The search begins at {@link stepTowardZero}(y) and proceeds
   *            toward neutral.
   * @returns An array of {@link EngineProjectionSlice}, each describing
   *          a projection slice with its Y-index and knot interval
   *          `{ start, end }`.
   *
   * @example
   * // Given chronicles on multiple Y-levels, get the cumulative projection
   * const projection = this.getTotalProjection(3);
   * // projection: [
   * //   { y: 2, knots: { start: 12345, end: 67890 } },
   * //   { y: 1, knots: { start: 67890, end: Infinity } }
   * // ]
   */
  private getTotalProjection(y: number): EngineProjectionSlice[] {
    /**
     * Should the y depth happen to be equal to zero, there is nothing
     * that could be projected anywhere.
     */
    if (y == 0) return [];

    return (
      this.reduceYToNeutral(
        this.stepTowardZero(y),
        (accumulator, level, cy) => {
          const last = level.peekLast();
          if (last) {
            /**
             * If the current iteration chronicle is completely shadowed by
             * the previous chronicle, do not consider the current chronicle.
             */
            if (
              accumulator.length &&
              accumulator[accumulator.length - 1].knots.start >=
                last.$.knots.end
            ) {
              return accumulator;
            }

            /** Correct last iteration, if there is one */
            if (accumulator.length > 1) {
              accumulator[accumulator.length - 2].knots.end = last.$.knots.end;
            }

            /** Push in current iteration */
            accumulator.push({
              y: cy,
              knots: {
                start: last.$.knots.end,
                end: Infinity,
              },
            });

            return accumulator;
          }

          return [];
        },
        [] as EngineProjectionSlice[],
      ) ?? []
    );
  }

  /**
   * @author Lukas Diegelmann
   *
   * Compute the projection of an insertion chronicle at a given depth.
   *
   * Starting from the total projection at the specified Y-level,
   * this method cuts each projection slice so it fits within the
   * time span (`knots.start` → `knots.end`) of the insertion chronicle.
   *
   * Rules applied:
   * - Slices ending before the chronicle starts are skipped.
   * - Slices starting before the chronicle are cut at the chronicle start.
   * - Slices extending beyond the chronicle end are cut at the chronicle end.
   * - Slices starting after the chronicle ends are skipped.
   *
   * @param insertionChronicle - The chronicle whose time span constrains the projection.
   * @param insertionDepth - The depth (Y-level) where the chronicle is inserted.
   * @returns A list of projection slices clipped to the insertion chronicle’s bounds.
   */
  private getProjection(
    insertionChronicle: LinearChronicle,
    insertionDepth: ButterflyDepth,
  ): EngineProjectionSlice[] {
    const totalProjection = this.getTotalProjection(insertionDepth.y);

    /** The Accumulator collects the final slices */
    const accumulator: EngineProjectionSlice[] = [];

    /**
     * Now everything that is left for the algorithm is to cut the
     * total projection according to the size of the insertion chronicle.
     *
     *                  |------------------|              (insertionChronicle)
     *   x--------~~~~~~|~~                |              (~: Projection)
     *   x--------------|--                |
     *   x---------     |  ~~~~~~~~        |
     *   x--------------|----------~~~~~~~~|~~~~~~~~~~~
     *                  |                  | <- needed cut.
     *
     * Once the algorithm has completed this task the projection data
     * has been successfully calculated.
     */
    totalProjection.forEach(slice => {
      /**
       * In case the current slice ends before the insertionChronicle even
       * starts it can be skipped.
       *
       *                    ------------     (insertionChronicle)
       *   x----~~~~~~~~~                    (current Slice)
       */
      if (slice.knots.end <= insertionChronicle.knots.start) {
        return;
      }

      /**
       * In case the current slice starts earlier than the insertion chronicle
       * it needs to be cut.
       *
       *                  -----------         (insertionChronicle)
       *        x------~~~~~~~~~              (current Slice)
       */
      if (slice.knots.start < insertionChronicle.knots.start) {
        slice.knots.start = insertionChronicle.knots.start;
      }

      /**
       * In case the insertion chronicle ends earlier than the current slice
       * the slice must be cut.
       *
       *                  -------------        (insertionChronicle)
       *          x--------------~~~~~~~~~~~   (current Slice)
       */
      if (slice.knots.end > insertionChronicle.knots.end) {
        slice.knots.end = insertionChronicle.knots.end;
      }

      /**
       * In case the insertion chronicle has already ended before the current
       * slice even begins to start, the slice can be skipped.
       *
       *             --------------             (insertionChronicle)
       *    x--------------------------~~~~~~~~ (current Slice)
       */
      if (slice.knots.start >= insertionChronicle.knots.end) {
        return;
      }

      /**
       * At this point the slice has been cut accordingly and can now be added
       * to the accumulator.
       */
      accumulator.push(slice);
    });

    return accumulator;
  }

  private getTakeoverPath(
    insertionChronicle: LinearChronicle,
    insertionDepth: ButterflyDepth,
  ) {
    /** Find `projection` */
    const projection = this.getProjection(insertionChronicle, insertionDepth);

    console.log(
      "projectionData",
      projection.map(v => {
        const start = new Date(v.knots.start).toISOString();
        const end =
          v.knots.end !== Infinity
            ? new Date(v.knots.end).toISOString()
            : "infin";

        return { ...v, knots: { start, end } };
      }),
    );

    /** If there is no `projection` data, just insert it as is */
    if (!projection.length) {
      this.set(insertionDepth.y, insertionDepth.x, insertionChronicle);
    }

    /** Should there be `projection` data, filter `projection` for takeoverPath */
    projection.forEach((slice, i) => {
      if (i === 0) {
      }

      const length = slice.knots.end - slice.knots.start;

      /** If the slice is big enough to host a takeover maneuver, do it */
      if (length >= Engine.MANEUVER_TAKEOVER_SPACE_MIN) {
      }
    });
  }

  private getDurationWeightByLevel(y: number): number | undefined {
    const level = this.getLevel(y);

    if (level) {
      let acc = 0;
      for (const { cell } of level) {
        acc += cell.$.knots.end - cell.$.knots.start;
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
          const dw = this.getDurationWeightByLevel(-(index + 1));
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
    for (const { level, y } of this.iterateY()) {
      // Collect items left-to-right
      const items: Array<{ x: number; v: LinearChronicle }> = [];

      // Positive side 1, 2, …
      for (const { x, cell } of level) {
        items.push({ x, v: cell.$ });
      }

      console.group(`y=${y}`);
      for (const { x, v } of items) {
        // Assume v is a LinearChronicle

        const fmt = (ms: number) =>
          ms === Infinity ? "∞" : new Date(ms).toISOString().slice(0, 10);

        const start = fmt(v.knots.start);
        const end = fmt(v.knots.end);

        console.log(`x=${x}: ${v.title} | start=${start}, end=${end}`);
      }
      console.groupEnd();
    }
  }
}

export default Engine;
