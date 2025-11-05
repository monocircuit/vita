/*
 * Notes:
 *
 * About the information the Engine and the underlying Butterfly-Stack NEED to store. All they need to know about
 * is the `knots` information, meaning it might make sense to only pass the knots information (this might make)
 * the algorithm faster. -> after further consideration, each `linearChronicle` object passed to the `Engine` is a
 * link to the spot in memory where the specific object is located at. -> Although this might sound like: "okay then
 * it does not really matter" for each slice in a takeover maneuver there have to be deepcopies of each chronicle which
 * makes the process slow and memory intensive. Thus it would be smarter to just store the chronic information and have
 * an `id` field for when the renderer needs to now further information about the chronicle it can then look it up in
 * something like a redux store. (The current implementation does utilize these deepcopies though)
 *
 * Dynamic View Pipeline:
 *
 *                                        Events -> Engine -> Renderer
 *
 * Thus the Engine needs to completely define the behaviour of the dynamic view it is at its heart. This also implies
 * that the current version is just a very premature version of the final Engine. Ultimately the Engine needs to take
 * in environmental information and work with it, producing a usable butterfly for the renderer.
 *
 * Proccesing of a single Chronicle goes as follows:
 *
 * Chronicle -> linear Chronicle -> engine Chronicle
 *           -> static Chronicle
 */

import {
  o$LinearChronicle,
  oTLinearChronicle,
  TLinearChronicleKnots,
} from "@/shared/supabase/tables/chronicles/mapping";
import { getLinearChronicleLeftDelta } from "../../data/chronicles/getLinearChronicleDeltas";
import alignLinearChronicles from "../../data/chronicles/alignLinearChronicles";
import Butterfly, {
  ButterflyCell,
  IButterflyDepth,
} from "@/utils/structures/Butterfly";
import { BipolarLinkedListPolartity } from "@/utils/structures/BipolarDoublyLinkedList";
import zod from "zod";
import { oTVitaFragmentDynamic } from "@/utils/supabase/tables/vitas/shards/dynamic/_mapping";

interface IEngineProjectionSlice {
  y: number;
  knots: TLinearChronicleKnots;
}

const $EngineChronicle = o$LinearChronicle.omit({
  category: true,
  scope: true,
  createdAt: true,
  updatedAt: true,
  description: true,
  entityId: true,
  title: true,
  userId: true,
});

type TEngineChronicle = zod.infer<typeof $EngineChronicle>;

/**
 * @author Lukas Diegelmann
 *
 * @description
 * The `Engine` is the core of the dynamic vita view. It utilizes a `Butterfly` to
 * calculate the behaviour of the dynamic view and give this information further to
 * the `Renderer`.
 *
 * The `Engine` under the hood works with sharded chronicle information, meaning that
 * it only holds knowledge about the `id` and `knots` of a chronicle. This makes it
 * more memory efficient.
 */
class Engine extends Butterfly<TEngineChronicle> {
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

  private chronicles: TEngineChronicle[] = [];

  constructor() {
    super();
  }

  /**
   * @author Lukas Diegelmann
   *
   * Initiates the calculations for filling the inner `ButterflyStack` with
   * the correct chronicle information.
   */
  public init(chronicles: oTLinearChronicle[]) {
    /** The `Engine` is only supposed to load once, multiple loading is not possible */
    if (this.loaded) return;
    this.loaded = true;

    console.log("test init");

    /*
     * Parsing the passed chronicles to ensure that they are stripped of any overhang
     * for better memory usage.
     */
    console.log("chronicles", chronicles);
    this.chronicles = $EngineChronicle.array().parse(chronicles);

    /*
     * Saving all passed chronicles into the chronicle store and align them by the
     * start knot. This makes processing the chronicles simpler.
     */
    this.chronicles = alignLinearChronicles(this.chronicles);

    console.log("linear chronicles", this.chronicles);

    /** The first linear Chronicle can always fit into the neutral lane */
    this.push(0, this.chronicles[0]);

    /** Thus we start at the second linear Chronicle in line */
    /** The .getLatestPoints() function already ensures we get minimal depth */
    for (let i = 1; i < this.chronicles.length; i++) {
      const insertionChronicle = this.chronicles[i];
      console.warn(insertionChronicle.id);

      this.log();

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
    insertionChronicle: TEngineChronicle,
  ): IButterflyDepth {
    const lastCells = this.getLastCells();
    let insertionDepth: IButterflyDepth | null = null;

    /**
     * Find insertion point
     * (A point where the linear Chronicle fits in, into a layer with minimal depth)
     *
     * Depth > Weight (Depth is prioritized)
     */
    for (const lastCell of lastCells) {
      /** There is space in the layer to fit the linear Chronicle */
      if (getLinearChronicleLeftDelta(insertionChronicle, lastCell.$) < 0) {
        /**
         * Should the found space be in the neutral layer, the insertion point is found
         * and the algorithm can break out of the loop.
         */
        if (lastCell.y == 0) {
          insertionDepth = {
            y: 0,
            x: lastCell.x + 1,
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
        if (this.doesLevelExist(-lastCell.y)) {
          /**
           * The layer exists, thus the algorithm needs to check if there is enough space for the
           * `insertionChronicle`.
           */
          if (getLinearChronicleLeftDelta(insertionChronicle, lastCell.$)) {
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

            let x = lastCell.x;

            /* Should there be a switchup, meaning the chronicle is supposed to be
               inserted at the opposite side than the current lastVector, calculate
               the x value accordingly */
            if (
              (positiveDurationWeight > negativeDurationWeight &&
                lastCell.y > 0) ||
              (positiveDurationWeight < negativeDurationWeight &&
                lastCell.y < 0)
            ) {
              /* Switch last vector to the other side */
              const result = lastCells.find(vector => vector.y == -lastCell.y);

              if (result) {
                x = result.x;
              } else {
                x = 0;
              }
            }

            /** Weight Check, put the Chronicle in the Area with less DurationWeight */
            if (positiveDurationWeight > negativeDurationWeight) {
              /** PUT THE CHRONICLE IN THE NEGATIVE AREA */
              return {
                y: -Math.abs(lastCell.y),
                x: x + 1,
              };
            } else {
              /** PUT THE CHRONICLE IN THE POSITIVE AREA */
              return {
                y: +Math.abs(lastCell.y),
                x: x + 1,
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
   * @returns An array of {@link IEngineProjectionSlice}, each describing
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
  private getTotalProjection(y: number): IEngineProjectionSlice[] {
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
        [] as IEngineProjectionSlice[],
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
    insertionChronicle: TEngineChronicle,
    insertionDepth: IButterflyDepth,
  ): IEngineProjectionSlice[] {
    const totalProjection = this.getTotalProjection(insertionDepth.y);

    /** The Accumulator collects the final slices */
    const accumulator: IEngineProjectionSlice[] = [];

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
    insertionChronicle: TEngineChronicle,
    insertionDepth: IButterflyDepth,
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

    /** If there is no `projection` data, just insert it as is, the algorith comes
        to an end at this point. */
    if (!projection.length) {
      this.set(insertionDepth.y, insertionDepth.x, insertionChronicle);
      return;
    }

    /* At first filter all projection slices to size, if they can fit
       a takeover maneuver or not */
    projection.filter(slice => {
      const duration = slice.knots.end - slice.knots.start;

      return duration >= Engine.MANEUVER_TAKEOVER_SPACE_MIN;
    });

    /* Initialize temporary pointer to the null pointer */
    let tmp: null | ButterflyCell<TEngineChronicle> = null;

    /* Add the root element of the chronicle path, meaning the part of
       the lane comes before the first slice path */
    const result = this.set(insertionDepth.y, insertionDepth.x, {
      ...insertionChronicle,
      knots: {
        start: insertionChronicle.knots.start,
        end: projection[0].knots.start,
      },
    });

    /* Setting the pointers to the correct positions */
    if (result) {
      result.prev = null;
      result.next = null;
      tmp = result;
    }

    /** Should there be `projection` data, filter `projection` for takeoverPath */
    projection.forEach(slice => {
      const result = this.push(slice.y, {
        ...insertionChronicle,
        knots: {
          start: slice.knots.start,
          end: slice.knots.end,
        },
      });

      if (result && tmp) {
        tmp.next = result;
        result.next = null;
        result.prev = tmp;
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
      const items: Array<{ x: number; v: TEngineChronicle }> = [];

      // Positive side 1, 2, …
      for (const { x, cell } of level) {
        items.push({ x, v: cell.$ });
      }

      console.group(`y=${y}`);
      for (const { x, v } of items) {
        // Assume v is a LinearChronicle

        const fmt = (ms: number) =>
          ms === Infinity ? "∞" : new Date(ms).toISOString().slice(0, 10);

        console.log(v.knots);
        const start = fmt(v.knots.start);
        const end = fmt(v.knots.end);

        console.log(`x=${x}: ${v.id} | start=${start}, end=${end}`);
      }
      console.groupEnd();
    }
  }

  public toJson(): oTVitaFragmentDynamic[] {
    const rows: oTVitaFragmentDynamic[] = [];

    // Map: cell -> id (für Lookup von prev/next)
    const cellToId = new Map<ButterflyCell<TEngineChronicle>, number>();

    // Parallel-Array: id -> cell (stabile Zuordnung im 2. Pass)
    const idToCell: ButterflyCell<TEngineChronicle>[] = [];

    let id = 0;

    // ---------- Pass 1: IDs vergeben, Zeilen anlegen ----------
    for (const { y, level } of this.iterateY()) {
      for (const { cell } of level) {
        const thisId = id++;

        cellToId.set(cell, thisId);
        idToCell[thisId] = cell;

        // defensiv: x extrahieren und in number[] casten
        const xArr = [cell.$.knots.start, cell.$.knots.end].filter(v =>
          Number.isFinite(v),
        );

        rows.push({
          id: thisId,
          prev_id: null, // wird in Pass 2 gesetzt
          next_id: null, // wird in Pass 2 gesetzt
          chronicle_id: cell.$.id,
          y,
          x: xArr,
        });
      }
    }

    // ---------- Pass 2: prev_id / next_id via Map auflösen ----------
    for (let i = 0; i < rows.length; i++) {
      const entry = rows[i];
      const cell = idToCell[i];

      if (!cell) continue;

      const prev = cell.prev as ButterflyCell<TEngineChronicle> | null;
      const next = cell.next as ButterflyCell<TEngineChronicle> | null;

      if (prev) {
        entry.prev_id = cellToId.get(prev) ?? null;
      }
      if (next) {
        entry.next_id = cellToId.get(next) ?? null;
      }
    }

    return rows;
  }
}

export default Engine;
