/** @author Lukas Diegelmann */

/**
 * Types for the ButterflyStack
 */
export type ButterflyStackVerticalDepth = number;
export type ButterflyStackHorizontalDepth = number;

export interface ButterflyStackDimensions {
  positive: number;
  negative: number;
}

export interface ButterflyStackDepth {
  vertical: ButterflyStackVerticalDepth;
  horizontal: ButterflyStackHorizontalDepth;
}

export interface ButterflyStackVector<Value> {
  depth: ButterflyStackDepth;
  value: Value;
}

export enum ButterflyStackField {
  Positive = 1,
  Neutral = 0,
  Negative = -1,
}

/**
 * A Butterfly Stack behaves like a two-dimensional stack, that is abstracted to fit
 * the needs of layering elements in a timeline.
 *
 * The stack consists of three areas, a neutral area (0), a positive area (>0) and a negative area (<0).
 *
 * Each element in the stack can be addressed by its vertical and horizontal depth. The
 * behaves like an index, meaning a vertical depth of 0 means the neutral layer, and with
 * each increment you step up one layer in the stack. The horizontal depth behaves no
 * different than a normal array index.
 */
class ButterflyStack<Value> {
  protected neutralLayer: Value[] = [];
  protected positiveLayers: Value[][] = [];
  protected negativeLayers: Value[][] = [];

  constructor() {}

  public getNeutralLayer() {
    return this.neutralLayer;
  }

  public getPositiveLayers() {
    return this.positiveLayers;
  }

  public getNegativeLayers() {
    return this.negativeLayers;
  }

  /**
   * Return the latest points of each layer in the stack, i.e. the points at the right end of each layer
   *
   * The order of the points is:
   * 1. The latest point of the neutral layer (if it exists)
   * 2. The latest points of the positive and negative layers, alternating between positive and negative,
   */
  public getLastPoints() {
    const points: ButterflyStackVector<Value>[] = [];

    /** Pushing in the latest neutral layer item first */
    if (this.neutralLayer.length) {
      points.push({
        value: this.neutralLayer[this.neutralLayer.length - 1],
        depth: {
          vertical: 0,
          horizontal: this.neutralLayer.length - 1,
        },
      });
    }

    /** Alternating between positive and negative layers and pushing points in */
    let i = 0;
    console.log(this.positiveLayers.length, this.negativeLayers.length);
    while (i < this.positiveLayers.length + this.negativeLayers.length) {
      const verticalDepth = ButterflyStack.alternateVerticalDepth(
        this.indexToDepth(i),
      );

      console.log("i", this.indexToDepth(i), "verticalDepth", verticalDepth);

      if (this.checkLayerExistance(verticalDepth)) {
        const layer = this.getLayer(verticalDepth);

        points.push({
          value: layer[layer.length - 1],
          depth: {
            vertical: verticalDepth,
            horizontal: layer.length - 1,
          },
        });
      }

      i++;
    }

    return points;
  }

  private indexToDepth(index: number) {
    return index + 1;
  }

  private depthToIndex(depth: number) {
    return Math.abs(depth) - 1;
  }

  public getLayerWeight(verticalDepth: number) {
    return this.getLayer(verticalDepth).length;
  }

  public getFieldWeight(area: ButterflyStackField) {
    switch (area) {
      case ButterflyStackField.Positive:
        return this.positiveLayers.reduce(
          (acc, layer) => acc + layer.length,
          0,
        );
      case ButterflyStackField.Negative:
        return this.negativeLayers.reduce(
          (acc, layer) => acc + layer.length,
          0,
        );
      case ButterflyStackField.Neutral:
        return this.neutralLayer.length;
    }
  }

  public addValue(value: Value, verticalDepth: number) {
    if (verticalDepth == 0) {
      this.neutralLayer.push(value);
    }
    if (verticalDepth > 0) {
      const i = verticalDepth - 1;
      if (!this.positiveLayers[i]) this.positiveLayers[i] = [];
      this.positiveLayers[i].push(value);
    }
    if (verticalDepth < 0) {
      const i = -1 * verticalDepth - 1;
      if (!this.negativeLayers[i]) this.negativeLayers[i] = [];
      this.negativeLayers[i].push(value);
    }
  }

  //dachte schreibe die Value nach der Normalisierung um, mache das aber doch bei rendering jedes mal neu --> Vielleicht brauchen wir das noch deshalb bleibt das
  public setValue(
    verticalDepth: number,
    horizontalDepth: number,
    value: Value,
  ) {
    const layer = this.getLayer(verticalDepth);

    if (layer.length <= horizontalDepth)
      throw new Error("Invalid horizontal Depth");

    //write to positive Layer
    if (verticalDepth > 0) {
      if (this.positiveLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      this.positiveLayers[this.depthToIndex(verticalDepth)][horizontalDepth] =
        value;
    }

    //write to negativ Layer
    if (verticalDepth < 0) {
      if (this.negativeLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      this.negativeLayers[this.depthToIndex(verticalDepth)][horizontalDepth] =
        value;
    }

    //write to neutralLayer
    this.neutralLayer[horizontalDepth] = value;
  }

  public getValue(verticalDepth: number, horizontalDepth: number) {
    const layer = this.getLayer(verticalDepth);

    if (layer.length <= horizontalDepth)
      throw new Error("Invalid horizontal Depth");

    return this.getLayer(verticalDepth)[horizontalDepth];
  }

  public getLastValue(verticalDepth: number) {
    const layer = this.getLayer(verticalDepth);
    return layer[layer.length - 1];
  }

  public getPositiveDimension() {
    return this.positiveLayers.length;
  }

  public getNegativeDimension() {
    return this.negativeLayers.length;
  }

  public getDimensions(): ButterflyStackDimensions {
    return {
      positive: this.getPositiveDimension(),
      negative: this.getNegativeDimension(),
    };
  }

  /**
   * Retrieves the layer at the given vertical depth.
   *
   * Positive depths are looked up in `positiveLayers`, negative depths
   * in `negativeLayers`, and depth `0` returns the `neutralLayer`.
   *
   * If no layer exists at the requested depth (e.g. the index is out of
   * bounds for the corresponding array), the method returns `null`.
   *
   * @param verticalDepth - The depth of the desired layer.
   *                        Positive values refer to layers above neutral,
   *                        negative values to layers below neutral,
   *                        and `0` refers to the neutral layer itself.
   * @returns The layer at the given vertical depth, or `null` if none exists.
   */
  public getLayer(verticalDepth: number) {
    if (verticalDepth > 0) {
      if (this.positiveLayers.length <= this.depthToIndex(verticalDepth))
        return null;
      return this.positiveLayers[this.depthToIndex(verticalDepth)];
    }

    if (verticalDepth < 0) {
      if (this.negativeLayers.length <= this.depthToIndex(verticalDepth))
        return null;
      return this.negativeLayers[this.depthToIndex(verticalDepth)];
    }

    return this.neutralLayer;
  }

  public pointToDepth(point: ButterflyStackVector<Value>): ButterflyStackDepth {
    return {
      vertical: point.depth.vertical,
      horizontal: point.depth.horizontal,
    };
  }

  public getLastPoint(
    verticalDepth: number,
  ): ButterflyStackVector<Value | null> {
    if (!this.checkLayerExistance(verticalDepth))
      return {
        value: null,
        depth: { vertical: verticalDepth, horizontal: null },
      };

    const layer = this.getLayer(verticalDepth);

    return {
      value: layer[layer.length - 1],
      depth: {
        vertical: verticalDepth,
        horizontal: layer.length - 1,
      },
    };
  }

  public getFullStack() {
    return {
      neutral: this.neutralLayer,
      positive: this.positiveLayers,
      negative: this.negativeLayers,
    };
  }

  public checkLayerExistance(verticalDepth: number) {
    if (verticalDepth == 0) return true;
    if (verticalDepth > 0) {
      return this.positiveLayers.length > verticalDepth - 1;
    }
    if (verticalDepth < 0) {
      return this.negativeLayers.length > Math.abs(verticalDepth) - 1;
    }
  }

  public logLastPoints() {
    const lastPoints = this.getLastPoints();

    lastPoints.forEach((lastPoint, i) =>
      console.log(`${i}: ${JSON.stringify(lastPoint.value)}`),
    );
  }

  public logPoints() {
    console.log("[POSITIVE LEVELS]");
    this.positiveLayers.forEach((array, i) => {
      console.log(`[LEVEL ${this.indexToDepth(i)}]:`);
      array.forEach((value, i) =>
        console.log(`[X: ${i}] ${JSON.stringify(value)}`),
      );
    });

    console.log("[NEUTRAL LEVEL]");
    this.neutralLayer.forEach((value, i) => {
      console.log(`[X: ${i}] ${JSON.stringify(value)}`);
    });

    console.log("[NEGATIVE LEVELS]");
    this.negativeLayers.forEach((array, i) => {
      console.log(`[LEVEL ${this.indexToDepth(i)}]:`);
      array.forEach((value, i) =>
        console.log(`[X: ${i}] ${JSON.stringify(value)}`),
      );
    });
  }

  /**
   * This function iterates from the initial positive layers (initial)
   * positive vertical depth, to the neutral layer. Should there be no
   * positive layers in the `ButterflyStack`, then there will still be a
   * function call for the neutral layer.
   */
  private iteratePositiveToNeutral(
    initialVerticalDepth: number,
    f: (vector: ButterflyStackVector<Value>) => void,
  ) {
    for (let i = initialVerticalDepth; i <= 0; i--) {
      f(this.getLastPoint(i));
    }
  }

  /**
   * This function iterates from the initial negative layers (initial)
   * vertical depth, to the neutral layer. Should there be no negative
   * layers in the `ButterflyStack`, then there will still be a function
   * call for the neutral layer.
   */
  private iterateNegativeToNeutral(
    initialVerticalDepth: number,
    f: (vector: ButterflyStackVector<Value>) => void,
  ) {
    for (let i = initialVerticalDepth; i <= 0; i++) {
      console.log("iterateNegativeToNeutral", i);
      f(this.getLastPoint(i));
    }
  }

  /**
   * Iterates from the given initial vertical depth back to the neutral layer (0).
   * Depending on the sign of `initialVerticalDepth`, this will call either
   * {@link iteratePositiveToNeutral} or {@link iterateNegativeToNeutral}.
   * The provided callback `f` is invoked once for each vertical depth
   * encountered, including the neutral layer.
   *
   * @param initialVerticalDepth - The starting depth. Positive values count down
   *                               toward 0, negative values count up toward 0,
   *                               and 0 invokes the callback only once.
   * @param f - A function that receives each vertical depth value during iteration.
   */
  public iterateToNeutral(
    initialVerticalDepth: number,
    f: (vector: ButterflyStackVector<Value>) => void,
  ) {
    if (initialVerticalDepth == 0) {
      f(this.getLastPoint(0));
    }
    if (initialVerticalDepth > 0) {
      this.iteratePositiveToNeutral(initialVerticalDepth, f);
    }
    if (initialVerticalDepth < 0) {
      this.iterateNegativeToNeutral(initialVerticalDepth, f);
    }
  }

  static alternateVerticalDepth(index: number) {
    return (index % 2 ? 1 : -1) * Math.ceil(index / 2);
  }

  static negativeVerticalDepthOperator(verticalDepth: number) {
    return verticalDepth + 1;
  }

  /** Is called like that because it is meant for coming from pos. to neg. values */
  static positiveVerticalDepthOperator(verticalDepth: number) {
    return verticalDepth - 1;
  }

  static neutralVerticalDepthOperator(verticalDepth: number) {
    return verticalDepth;
  }

  /**
   * returns the vertical depth operator to get from outer depths to the neutral layer
   */
  static getVerticalDepthOperator(verticalDepth: ButterflyStackVerticalDepth) {
    const sign = Math.sign(verticalDepth);

    if (sign == 1) return ButterflyStack.positiveVerticalDepthOperator;
    if (sign == -1) return ButterflyStack.negativeVerticalDepthOperator;

    return ButterflyStack.neutralVerticalDepthOperator;
  }
}

export default ButterflyStack;
