/** ANCHOR: DEPRICATED */

import { ChronicleOrientation } from "../../shared/supabase/enumerated-types/ChronicleOrientation";

type LayeredTreeSortInComparator<Value> = (
  staticValue: Value,
  dynamicValue: Value,
) => boolean;

type LayeredTreeEmbeddedSortIn<Value> = (
  context: LayeredTree<Value>,
  value: Value,
  comparator: (value: Value, layeredValue: Value) => boolean,
) => LayeredTree<Value>;

interface LayeredTreeChildren<Value> {
  above?: LayeredTree<Value>;
  below?: LayeredTree<Value>;
}

interface LayeredTreeOptions<Value> {
  value?: Value;
  ancestor?: LayeredTree<Value>;
  embeddedSortIn?: LayeredTreeEmbeddedSortIn<Value>;
  orientation?: LayeredTreeOrientation;
  depth?: number;
}

export enum LayeredTreeOrientation {
  ABOVE,
  BELOW,
  NEUTRAL,
}

class LayeredTree<Value> {
  /** NON-OPTIONAL ATTRIBUTES */
  private depth: number = 0;
  private values: Value[] = [];
  private children: LayeredTreeChildren<Value> = {};
  private orientation: LayeredTreeOrientation = LayeredTreeOrientation.NEUTRAL;

  /** OPTIONAL ATTRIBUTES */
  private ancestor?: LayeredTree<Value>;
  private embeddedSortIn?: LayeredTreeEmbeddedSortIn<Value>;

  constructor(options?: LayeredTreeOptions<Value>) {
    if (options) {
      if (options.value) this.values.push(options.value);
      if (options.ancestor) this.ancestor = options.ancestor;
      if (options.embeddedSortIn) this.embeddedSortIn = options.embeddedSortIn;
      if (options.orientation) this.orientation = options.orientation;
      if (options.depth) this.depth = options.depth;
    }

    return this;
  }

  get weight() {
    /** Getting own layer weight */
    let weight = this.values.length;

    /** Adding the weight of the children */
    if (this.children.above) weight += this.children.above.weight;
    if (this.children.below) weight += this.children.below.weight;

    return weight;
  }

  get flattened() {
    const coordinates: LayeredTree<Value>[] = [];
    coordinates.push(this);

    if (this.children.above) {
      coordinates.push(...this.children.above.flattened);
    }

    if (this.children.below) {
      coordinates.push(...this.children.below.flattened);
    }

    return coordinates;
  }

  get lastValue() {
    return this.values[this.values.length - 1];
  }

  public getDepth() {
    return this.depth;
  }

  public getValues() {
    return this.values;
  }

  public balanceValueOnChildren(value: Value) {
    /** In both of these scenarious it is not done with that. */
    if (!this.children.above) {
      /** If there is no above child, just put the value there and be done */
      this.addValue(value, LayeredTreeOrientation.ABOVE);
      return LayeredTreeOrientation.ABOVE;
    }

    if (!this.children.below) {
      /** If there is no below child, just put the value there and be done */
      this.addValue(value, LayeredTreeOrientation.BELOW);
      return LayeredTreeOrientation.BELOW;
    }

    /** If there exists both a above and a below child, choose the one with the least weight */
    /** This ensures that the LayeredTree will be balanced out. */
    const child =
      this.children.above.weight < this.children.below.weight
        ? this.children.above
        : this.children.below;

    child.addValue(value, LayeredTreeOrientation.NEUTRAL);

    return LayeredTreeOrientation.NEUTRAL;
  }

  public addValue(value: Value, orientation: LayeredTreeOrientation) {
    switch (orientation) {
      case LayeredTreeOrientation.ABOVE:
        if (!this.children.above) {
          this.children.above = this.constructChild(
            value,
            LayeredTreeOrientation.ABOVE,
          );
        } else {
          this.children.above.addValue(value, LayeredTreeOrientation.NEUTRAL);
        }
        break;
      case LayeredTreeOrientation.BELOW:
        if (!this.children.below) {
          this.children.below = this.constructChild(
            value,
            LayeredTreeOrientation.BELOW,
          );
        } else {
          this.children.below.addValue(value, LayeredTreeOrientation.NEUTRAL);
        }
        break;
      case LayeredTreeOrientation.NEUTRAL:
        /** TODO: Sort layer when new value is pushed in! */
        this.values.push(value);
        break;
    }
  }

  public getChildren() {
    return this.children;
  }

  public hasAncestor() {
    return !!this.ancestor;
  }

  public getAncestor() {
    return this.ancestor;
  }

  public sortIn(value: Value, comparator: LayeredTreeSortInComparator<Value>) {
    if (this.embeddedSortIn) {
      try {
        this.embeddedSortIn(this, value, comparator);
      } catch (error) {
        console.error(error);
      }

      return this;
    }

    try {
      this.defaultSortIn(value, comparator);
    } catch (error) {
      console.error(error);
    }

    return this;
  }

  private constructChild(value: Value, orientation: LayeredTreeOrientation) {
    return new LayeredTree({
      ancestor: this,
      embeddedSortIn: this.embeddedSortIn,
      value,
      orientation,
      depth: this.depth + 1,
    });
  }

  /**
   * The comparator function tells the Tree if the value should be sorted in as a child
   * or an ancestor.
   *
   * The access point for this function will be the node that the function is called from,
   * meaning that the value will only be compared on the branches following this node, not its
   * ancestors.
   *
   * The function returns the node where the value was sorted in.
   *
   * If comparatur return `true` the value will be inserted into the layer in `neutral` orientation.
   * Should the result be `false` the value will be put into a child.
   */
  public defaultSortIn(
    value: Value,
    comparator: (value: Value, layeredValue: Value) => boolean,
  ) {
    let shouldBeSortedIn = true;

    /** If the length of the layer is 0, the value will be sorted in neutral orientation */
    for (let i = 0; i < this.values.length; i++) {
      /** Look if there is enough space to fit the value into the layer (needs to be designed by the comparator) */
      console.log("comparator result", comparator(value, this.values[i]));
      if (!comparator(value, this.values[i])) {
        shouldBeSortedIn = false;
        break;
      }
    }

    /** Recursive operation is done if there is a spot to fit the value */
    if (shouldBeSortedIn) {
      this.addValue(value, LayeredTreeOrientation.NEUTRAL);
      return;
    }

    /** If not the algorithm needs to search for another spot in a child */

    /** If there is no child in the above orientation, fill the value there */
    if (!this.children.above) {
      this.addValue(value, LayeredTreeOrientation.ABOVE);
      return;
    }
    /** If there is no child in the below orientation, fill the value there */
    if (!this.children.below) {
      this.addValue(value, LayeredTreeOrientation.BELOW);
      return;
    }

    /** If there exist both above and below children, then add the value to the one with the smaller weight */
    const child =
      this.children.above.weight < this.children.below.weight
        ? this.children.above
        : this.children.below;

    child.defaultSortIn(value, comparator);
  }
}

export default LayeredTree;
