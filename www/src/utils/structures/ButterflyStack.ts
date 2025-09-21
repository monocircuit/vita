import {
  ButterflyStackDepth,
  ButterflyStackPoint,
  ButterflyStackVerticalDepth,
} from "./ButterflyStack.d";

class ButterflyStack<Value> {
  private neutralLayer: Value[] = [];
  private positiveLayers: Value[][] = [];
  private negativeLayers: Value[][] = [];

  constructor() { }

  public getLatestPoints() {
    const points: ButterflyStackPoint<Value>[] = [];

    if (this.neutralLayer.length) {
      points.push({
        value: this.neutralLayer[this.neutralLayer.length - 1],
        depth: {
          vertical: 0,
          horizontal: this.neutralLayer.length - 1,
        },
      });
    }

    let i = 1;
    while (i < this.positiveLayers.length + this.negativeLayers.length) {
      const verticalDepth = ButterflyStack.alternateVerticalDepth(i);
      const layer = this.getLayer(verticalDepth);

      points.push({
        value: layer[layer.length - 1],
        depth: {
          vertical: verticalDepth,
          horizontal: layer.length - 1,
        },
      });

      i++;
    }

    this.positiveLayers.forEach((layer, i) =>
      points.push({
        value: layer[layer.length - 1],
        depth: {
          vertical: this.indexToDepth(i),
          horizontal: layer.length - 1,
        },
      }),
    );

    this.negativeLayers.forEach((layer, i) =>
      points.push({
        value: layer[layer.length - 1],
        depth: {
          vertical: -1 * this.indexToDepth(i),
          horizontal: layer.length - 1,
        },
      }),
    );

    return points;
  }

  private indexToDepth(index: number) {
    return index + 1;
  }

  private depthToIndex(depth: number) {
    return Math.abs(depth) - 1;
  }

  public getWeight(verticalDepth: number) {
    return this.getLayer(verticalDepth).length;
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
  public setValue(verticalDepth: number, horizontalDepth: number, value: Value){
    const layer = this.getLayer(verticalDepth);

    if (layer.length <= horizontalDepth)
      throw new Error("Invalid horizontal Depth");


    //write to positiv Layer
    if (verticalDepth > 0) {
      if (this.positiveLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      this.positiveLayers[this.depthToIndex(verticalDepth)][horizontalDepth] = value;
    }

    //write to negativ Layer
    if (verticalDepth < 0) {
      if (this.negativeLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      this.negativeLayers[this.depthToIndex(verticalDepth)][horizontalDepth] = value;
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

  public getPositiveLayerHeight() {
    return this.positiveLayers.length;
  }

  public getNegativeLayerHeight() {
    return this.negativeLayers.length;
  }

  public getLayerHeight() {
    return {
      positive: this.getPositiveLayerHeight(),
      negative: this.getNegativeLayerHeight(),
    };
  }

  public getLayer(verticalDepth: number) {
  if (verticalDepth > 0) {
      if (this.positiveLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      return this.positiveLayers[this.depthToIndex(verticalDepth)];
    }

    if (verticalDepth < 0) {
      if (this.negativeLayers.length <= this.depthToIndex(verticalDepth))
        throw new Error("Invalid vertical Depth");
      return this.negativeLayers[this.depthToIndex(verticalDepth)];
    }

    return this.neutralLayer;
  }

  public pointToDepth(point: ButterflyStackPoint<Value>): ButterflyStackDepth {
    return {
      vertical: point.depth.vertical,
      horizontal: point.depth.horizontal,
    };
  }

  public getLastPoint(verticalDepth: number): ButterflyStackPoint<Value> {
    const layer = this.getLayer(verticalDepth);

    return {
      value: layer[layer.length - 1],
      depth: {
        vertical: verticalDepth,
        horizontal: layer.length - 1,
      },
    };
  }

  static alternateVerticalDepth(index: number) {
    return Math.pow(-1, index + 1) * Math.ceil(index);
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
