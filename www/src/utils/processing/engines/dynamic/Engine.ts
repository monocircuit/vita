import { Chronicle, LinearChronicle } from "@/utils/schemas/Chronicle";
import ButterflyStack from "@/utils/structures/ButterflyStack";
import { ButterflyStackDepth } from "@/utils/structures/ButterflyStack.d";
import filterChronicles from "../../data/chronicles/filterChronicles";
import {
  getLinearChronicleLeftDelta,
  getLinearChronicleRightDelta,
} from "../../data/chronicles/getLinearChronicleDeltas";
import alignLinearChronicles from "../../data/chronicles/alignLinearChronicles";
import { produce } from "immer";
import daysToMs from "../../data/chronicles/daysToMs";

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
      const latestPoints = this.getLatestPoints();

      console.warn(insertionChronicle.title);
      console.log("latestPoints", latestPoints);

      /** Find `insertionDepth` */
      const insertionDepth = this.getInsertionDepth(insertionChronicle);

      console.log("insertionDepth", insertionDepth);

      /** Find `takeoverLeapVerticalDepth` */
      const takeoverPath = this.getTakeoverPath(
        insertionChronicle,
        insertionDepth,
      );

      console.log("takeoverDepths", takeoverPath);
    }
  }

  private getInsertionDepth(insertionChronicle: LinearChronicle) {
    const latestPoints = this.getLatestPoints();
    let insertionDepth: ButterflyStackDepth | null = null;

    /** Find insertion point 
      (A point where the linear Chronicle fits in, into a layer with minimal depth) */
    for (let j = 0; j < latestPoints.length; j++) {
      const latestPoint = latestPoints[j];

      /** There is space in the layer to fit the linear Chronicle */
      if (
        getLinearChronicleLeftDelta(insertionChronicle, latestPoint.value) < 0
      ) {
        /** Do weight check */
        /** For the weight check we do not need points, depth is sufficient */
        insertionDepth = this.pointToDepth(latestPoint);
        for (
          let k = j;
          k < j + Math.pow(2, (insertionDepth as ButterflyStackDepth).vertical);
          k++
        ) {
          const currentVerticalDepth = ButterflyStack.alternateVerticalDepth(k);

          if (
            this.getWeight((insertionDepth as ButterflyStackDepth).vertical) <
            this.getWeight(currentVerticalDepth)
          ) {
            insertionDepth = {
              vertical: currentVerticalDepth,
              horizontal: this.getLayer(currentVerticalDepth).length,
            };
          }
        }

        /** Cancel the outer loop, because the algorithm found an insertion point */
        break;
      }

      if (!insertionDepth) {
        /** In case there was no insertion point found, create a new layer */
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
}

export default Engine;
