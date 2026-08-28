import Two from "two.js";
import { Anchor } from "two.js/src/anchor";
import { Path } from "two.js/src/path";

interface BranchOptions {
  /**
   * Is an identifier for the Branch, in order to better
   * debug the network and enhance features.
   */
  id: string | null | undefined;
  /**
   * The `layerWidth` defines how far appart the branches
   * are rendered.
   */
  layerWidth: number;
}

class Tree {
  /**
   * Default values.
   */
  private DEFAULT_LAYERWIDTH = 50;

  private layerWidth: number = this.DEFAULT_LAYERWIDTH;

  private two: Two | null = null;

  private path: Path | null = null;

  /**
   * Parent branch of this branch object.
   */
  private parent: Tree | null = null;

  /**
   * Child branches that go off of this branch object.
   */
  private children: Tree[] = [];

  /**
   * Gives information about how deep the Branch is in the
   * network.
   *
   * For example the stem has a depth of 0 and a first
   * degree child branch of the stem has a depth of 1.
   */
  private depth: number = 0;

  /**
   * The `oriantation` of the branch tells to branch if it
   * should render on top or below its parent branch.
   */
  private orientation: boolean = true;

  // private length: number = 0;
  private color: string = "#000";

  /** You need to give the Two.js Enviroment, a start and end coordinate on the x-axis
   * and if you want a seperate Layerwitdth if you want to lock it for a branch   */
  constructor(
    /**
     * The `startX` value corresponds to the x-value in the
     * local cartesian coordinates system, where the branch
     * should start rendering.
     */
    private startX: number,
    /**
     * The `endX` value corresponds to the x-value in the
     * local cartesian coordinates system, where the branch
     * should stop rendering.
     */
    private endX: number,
    /**
     * An instance of optional BranchOptions that define how
     * the `Branch` behaves.
     */
    private options: BranchOptions = {
      /** ANCHOR: Default values for Partial */
      id: "unset",
      layerWidth: 50,
    },
  ) {}

  /**
   * ANCHOR: Getters
   */
  /**
   * Yields a Two.Vector object, that holds information about
   * the coordinates where the branch should start rendering.
   *
   * These coordinates correspond to the this.start value.
   */
  get isLongerThanParent() {
    if (!this.parent) return undefined;
    return this.parent.endX < this.endX;
  }

  private getStartVector() {
    if (!this.parent?.path) return;
    return this.parent.path.getPointAt(this.startX / this.parent.endX);
  }

  private getEndVector() {
    if (!this.parent?.path) return;
    return this.parent.path.getPointAt(this.endX / this.parent.endX);
  }

  private getHorizontalLength() {
    return this.endX - this.startX;
  }

  private getHorizontalBezierLength() {
    const horizontalLength = this.getHorizontalLength();
  }

  private renderBranch(height: number): Path {
    if (!this.two) {
      throw new Error("Tree rendering context is not initialized.");
    }

    const startX = this.parent?.path
      ? this.parent.path.vertices[0].x + this.startX
      : this.startX;
    const endX = this.parent?.path
      ? this.parent.path.vertices[0].x + this.endX
      : this.endX;

    return this.two.makeLine(startX, height, endX, height);
  }

  /**
   * `appendBranch` appends a new Branch to an existing one
   * and puts the new one above or below the parent branch.
   */
  appendBranch(
    branch: Tree,
    orientation?: boolean,
    autoSetLayerWidth: boolean = true,
  ) {
    /** Keep track of branch depth */
    branch.depth = this.depth + 1;

    /** set parent branch */
    branch.setParentBranch(this);
    if (orientation != null) branch.orientation = orientation;

    if (autoSetLayerWidth) {
      console.log("Layers automatically Set");
      branch.autoSetLayerWidth(this.options.layerWidth);
    } else {
      console.log("Layers didn´t change");
    }

    this.children.push(branch);
  }

  get length() {
    return this.endX - this.startX;
  }

  /**
   * Returns the y-coordinate of this branch at a given x-coordinate.
   * If the x is not on the line, it returns null.
   */
  getYAtX(x: number): number | undefined {
    const percentage = x / this.length;
    const y = this.path?.getPointAt(percentage)?.y;
    return y;
  }

  /** This will render the Branch you created with all Subbranches */
  render(height?: number) {
    if (!this.two) {
      return;
    }

    if (this.depth == 0) {
      /* ANCHOR: Handle Stem Rendering */

      this.path = this.two.makeLine(
        this.parent?.path
          ? this.parent.path.vertices[0].x + this.startX
          : this.startX,
        height ? height : 0,
        this.parent?.path
          ? this.parent.path.vertices[0].x + this.endX
          : this.endX,
        height ? height : 0,
      );
      this.path.stroke = "#000";
      this.path.linewidth = 4;
    } else {
      /* ANCHOR: Handle Branch Rendering */

      this.path = this.renderBranch(height ? height : 0);
      this.path.stroke = "#000";

      this.path.linewidth = 4;
      this.path.noFill();

      /* //upcoming changes maybe try to move each action like creation of Branch in a different function
            this.path = this.two.makeLine(
                this.parentBranch
                    ? this.parentBranch.path.vertices[0].x +
                          this.start +
                          (this.length * 1) / 4
                    : this.start,
                height ? height : 0,
                this.parentBranch
                    ? this.parentBranch.path.vertices[0].x + this.end
                    : this.end,
                height ? height : 0
            );
            this.path.stroke = "#000";
            this.path.linewidth = 4;

            const startAnchor = new Two.Anchor(
                this.parentBranch.path.vertices[0].x + this.start,
                this.parentBranch.path.vertices[0].y,
                0,
                0,
                (this.length * 1) / 5,
                0
            );
            const endAnchor = new Two.Anchor(
                this.path.vertices[0].x,
                this.path.vertices[0].y,
                (-this.length * 1) / 5,
                0,
                0,
                0
            );

            const startCurve = new Two.Path([startAnchor, endAnchor], false, true, false);
            startCurve.linewidth = 4;
            startCurve.noFill();

            this.two.add(startCurve as any); */
    }

    this.children.forEach(branch => {
      if (!this.path) {
        return;
      }

      console.log(branch.orientation);
      branch.render(
        branch.orientation
          ? this.path.vertices[0].y - branch.options.layerWidth
          : this.path.vertices[0].y + branch.options.layerWidth,
      );
    });
  }

  private setParentBranch(parentBranch: Tree) {
    this.parent = parentBranch;
  }

  private autoSetLayerWidth(layerWidth: number) {
    this.options.layerWidth = layerWidth;
    if (
      (this.orientation == false && this.parent?.orientation == true) ||
      (this.orientation == true && this.parent?.orientation == false)
    ) {
      console.log("changed Layerwidth on: " + this);
      this.parent?.autoSetLayerWidth(layerWidth * 2);
    }
  }

  getpath() {
    return this.path;
  }

  getBranches() {
    return this.children;
  }

  getLayerWidth() {
    return this.layerWidth;
  }
  getOrientation() {
    return this.orientation;
  }
}

export default Tree;
