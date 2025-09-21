import { Chronicle, LinearChronicle } from "@/utils/schemas/Chronicle";
import ButterflyStack, {
  ButterflyStackField,
  ButterflyStackDepth,
} from "@/utils/structures/ButterflyStack";
import filterChronicles from "../../data/chronicles/filterChronicles";
import {
  getLinearChronicleLeftDelta,
  getLinearChronicleRightDelta,
} from "../../data/chronicles/getLinearChronicleDeltas";
import alignLinearChronicles from "../../data/chronicles/alignLinearChronicles";
import { produce } from "immer";
import daysToMs from "@/utils/processing/data/chronicles/daysToMs";

class Engine extends ButterflyStack<LinearChronicle> {
  /**
   * Space for Constants
   */
  static MANEUVER_TAKEOVER_SPACE_FALL = 20;
  static MANEUVER_TAKEOVER_SPACE_REST_MIN = 50;

  private chronicles: {
    linear: LinearChronicle[];
    static: Chronicle[];
  } = { linear: [], static: [] };

  constructor(chronicles: Chronicle[]) {
    super();

    /** (1) remove all chronicles without knots */
    this.chronicles = filterChronicles(chronicles);
    /** (2) sort chronicles linearly by start knot */
    this.chronicles.linear = alignLinearChronicles(this.chronicles.linear);

    console.log("sortedLinearChronicles", this.chronicles.linear);

    /** The first linear Chronicle can always fit into the neutral lane */
    this.addValue(this.chronicles.linear[0], 0);

    /** Thus we start at the second linear Chronicle in line */
    /** The .getLatestPoints() function already ensures we get minimal depth */
    for (let i = 1; i < this.chronicles.linear.length; i++) {
      const insertionChronicle = this.chronicles.linear[i];
      const latestPoints = this.getLastPoints();

      console.warn(insertionChronicle.title);
      console.log("latestPoints", latestPoints);

      /** Find `insertionDepth` */
      const insertionDepth = this.getInsertionDepth(insertionChronicle);

      console.log("insertionDepth", insertionDepth);

      /** Find `takeoverLeapVerticalDepth` */
      // const takeoverPath = this.getTakeoverPath(
      //   insertionChronicle,
      //   insertionDepth,
      // );

      // console.log("takeoverDepths", takeoverPath);

      this.addValue(insertionChronicle, insertionDepth.vertical);
    }
  }

  /**
   * Calculates the insertion depth, i.e. the coordinates in the ButterflyStack, where
   * the Chronicle should start, before its split up and vice versa. It does this following
   * the principles of minimal depth and minimal duration weight, to ensure the best
   * possible display of the information.
   */
  private getInsertionDepth(insertionChronicle: LinearChronicle) {
    const latestPoints = this.getLastPoints();
    let insertionDepth: ButterflyStackDepth | null = null;

    /**
     * Find insertion point
     * (A point where the linear Chronicle fits in, into a layer with minimal depth)
     *
     * Depth > Weight (Depth is prioritized)
     */
    for (let j = 0; j < latestPoints.length; j++) {
      const latestPoint = latestPoints[j];

      /** There is space in the layer to fit the linear Chronicle */
      if (
        getLinearChronicleLeftDelta(insertionChronicle, latestPoint.value) < 0
      ) {
        /**
         * Should the found space be in the neutral layer, the insertion point is found
         * and the algorithm can break out of the loop.
         */
        if (latestPoint.depth.vertical == 0) {
          insertionDepth = {
            vertical: 0,
            horizontal: latestPoint.depth.horizontal + 1,
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
        if (this.checkLayerExistance(-latestPoint.depth.vertical)) {
          /**
           * The layer exists, thus the algorithm needs to check if there is enough space for the
           * `insertionChronicle`.
           */
          if (
            getLinearChronicleLeftDelta(
              insertionChronicle,
              this.getLastPoint(latestPoint.depth.vertical).value,
            )
          ) {
            /**
             * Now the algorithm has checked that there is in fact enough space to insert the
             * `insertionChronicle`, meaning now it makes sense to make a weight check, to see
             * in which area the `insertionChronicle` should be put.
             */
            const positiveAreaDurationWeight = this.getAreaDurationWeight(
              ButterflyStackField.Positive,
            );
            const negativeAreaDurationWeight = this.getAreaDurationWeight(
              ButterflyStackField.Negative,
            );

            /** Weight Check, put the Chronicle in the Area with less DurationWeight */
            if (positiveAreaDurationWeight > negativeAreaDurationWeight) {
              /** PUT THE CHRONICLE IN THE NEGATIVE AREA */
              return {
                vertical: -Math.abs(latestPoint.depth.vertical),
                horizontal: latestPoint.depth.horizontal + 1,
              };
            } else {
              /** PUT THE CHRONICLE IN THE POSITIVE AREA */
              return {
                vertical: +Math.abs(latestPoint.depth.vertical),
                horizontal: latestPoint.depth.horizontal + 1,
              };
            }
          }
        }
      }
    }

    /** In case there was no insertion point found, create a new layer */
    if (!insertionDepth) {
      const layerHeight = this.getLayerHeight();

      if (layerHeight.positive > layerHeight.negative) {
        /** Only insert into the negative layer if the postive layer is actually greater than the negative one */
        insertionDepth = {
          vertical: layerHeight.negative - 1,
          horizontal: 0,
        };
      } else {
        /** Insert into the positive layer if the negative layer is greater or equal to the positive height */
        insertionDepth = {
          vertical: layerHeight.positive + 1,
          horizontal: 0,
        };
      }
    }

    return insertionDepth as ButterflyStackDepth;
  }

  private getTakeoverPath(
    insertionChronicle: LinearChronicle,
    insertionDepth: ButterflyStackDepth,
  ) {
    /**
     * If the `insertionDepth` is `0` (neutral) then just add the Chronicle to the neutral layer, without any
     * more calculations.
     */
    if (insertionDepth.vertical === 0) {
      console.log("insertionDepth is neutral");
      return;
    }
    /**
     * If the `insertionDepth` has a positive `verticalDepth`, then subtract from the `verticalDepth` until
     * the `neutralLayer` is reached. If the insertion point has a negative vertical depth, add to the
     * `verticalDepth` until the `neutralLayer` is reached.
     */
    const operator = ButterflyStack.getVerticalDepthOperator(
      insertionDepth.vertical,
    );

    let iteratingVerticalDepth = (insertionDepth as ButterflyStackDepth)
      .vertical;

    let smallestRightDelta = 0;
    let currentStickoutDepth = iteratingVerticalDepth;

    let rests = 0;

    do {
      const iteratingChronicle = this.getLastValue(iteratingVerticalDepth);

      const rightDelta = getLinearChronicleRightDelta(
        insertionChronicle,
        iteratingChronicle,
      );

      if (
        rightDelta >=
        Engine.MANEUVER_TAKEOVER_SPACE_FALL +
          Engine.MANEUVER_TAKEOVER_SPACE_REST_MIN
      ) {
        /** There needs to happen a slice */
        const stickoutChronicle = this.getLastValue(currentStickoutDepth);

        /** If the root slice has not been placed yet */
        if (!rests) {
          this.addValue(
            /** Slicing the insertion Chronicle */
            produce(insertionChronicle, draft => {
              draft.knots.end = stickoutChronicle.knots.end;
            }),
            insertionDepth.vertical,
          );
        }

        /** Place the insertion chronicle on the rest area */
        this.addValue(
          produce(insertionChronicle, draft => {
            draft.knots.start =
              stickoutChronicle.knots.end +
              daysToMs(Engine.MANEUVER_TAKEOVER_SPACE_FALL);
            draft.knots.end = iteratingChronicle.knots.end;
          }),
          iteratingVerticalDepth,
        );

        rests++;
      }

      if (rightDelta <= smallestRightDelta) {
        smallestRightDelta = rightDelta;
        currentStickoutDepth = iteratingVerticalDepth;
      }

      iteratingVerticalDepth = operator(iteratingVerticalDepth);
    } while (iteratingVerticalDepth !== 0);

    if (!rests) {
      this.addValue(insertionChronicle, insertionDepth.vertical);
    }
  }

  private getLayerDurationWeight(verticalDepth: number) {
    return this.getLayer(verticalDepth).reduce(
      (acc, chronicle) => acc + (chronicle.knots.end - chronicle.knots.start),
      0,
    );
  }

  private getAreaDurationWeight(area: ButterflyStackField) {
    switch (area) {
      case ButterflyStackField.Positive:
        return this.positiveLayers.reduce(
          (acc, _layer, idx) => acc + this.getLayerDurationWeight(idx + 1),
          0,
        );
      case ButterflyStackField.Negative:
        return this.negativeLayers.reduce(
          (acc, _layer, idx) =>
            acc + this.getLayerDurationWeight(-1 * (idx + 1)),
          0,
        );
      case ButterflyStackField.Neutral:
        return this.getLayerDurationWeight(0);
    }
  }
}

export default Engine;
