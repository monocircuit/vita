import Two from "two.js";
import { Anchor } from "two.js/src/anchor";

interface Point {
  x: number;
  y: number;
}

export class Branch {
  /**
   * Default values.
   */
  private DEFAULT_LAYERWIDTH = 50;

  private two: Two;
  private layerWidth: number;
  private path: Two.Path | null = null;
  private parentBranch: Branch | null = null;
  private branches: Branch[] = [];
  private start: number = 0;
  private end: number = 0;
  private orientation: boolean = true;
  private length: number = 0;
  private color: string = "#000";

  /** You need to give the Two.js Enviroment, a start and end coordinate on the x-axis
   * and if you want a seperate Layerwitdth if you want to lock it for a branch   */
  constructor(two: Two, start: number, end: number, layerWidth?: number) {
    this.two = two;
    this.start = start;
    this.end = end;
    this.layerWidth = layerWidth ? layerWidth : this.DEFAULT_LAYERWIDTH;
    this.length = end - start;
  }

  /** With addBranch you can add a created Branch to an existing one */
  addBranch(branch: Branch, orientation?: boolean, autoSetLayerWidth: boolean = true) {
    branch.setParentBranch(this);
    orientation != null ? (branch.orientation = orientation!) : null;

    if (autoSetLayerWidth) {
      console.log("Layers automatically Set");
      branch.autoSetLayerWidth(branch.layerWidth);
    } else {
      console.log("Layers didn´t change");
    }

    this.branches.push(branch);
  }

  getStartCoordinates() {
    const startCoordinates = this.parentBranch?.path.getPointAt(this.start / this.parentBranch.end);
    return startCoordinates;
  }
  getEndCoordinates() {
    const endCoordinates = this.parentBranch?.path.getPointAt(this.end / this.parentBranch.end);
    return endCoordinates;
  }

  private renderBranch(height: number) {
    //Start des ersten Anchorpunkts muss berechnet werden: start des Parentbranches + die start x auf dem Parentbranch - 1/4 der neuen Length wegen bezier curve
    const startCoordinates = this.getStartCoordinates();

    const endCoordinates = this.getEndCoordinates();

    const startX = startCoordinates.x;
    const startY = startCoordinates.y;
    const endX = endCoordinates.x;
    const endY = endCoordinates.y;

    const lengthtest = endX - startX;

    const AnchorStartCurve1 = new Two.Anchor(startX, startY, 0, 0, (this.length * 1) / 5, 0);

    const AnchorStartCurve2 = new Two.Anchor(
      startX + (lengthtest * 1) / 4,
      startY + height,
      (-lengthtest * 1) / 5,
      0,
      0,
      0,
    );

    const AnchorStartStraight = new Two.Anchor(
      startX + (lengthtest * 1) / 4,
      startY + height,
      0,
      0,
      0,
      0,
    );

    const AnchorEndStraight = new Two.Anchor(endX - lengthtest / 4, startY + height, 0, 0, 0, 0);

    const AnchorEndCurve1 = new Two.Anchor(
      endX - lengthtest / 4,
      startY + height,
      0,
      0,
      (lengthtest * 1) / 5,
      0,
    );

    const AnchorEndCurve2 = new Two.Anchor(endX, startY, (-lengthtest * 1) / 5, 0, 0, 0);

    const AnchorMidStraight = new Two.Anchor(endX, startY + height, 0, 0, 0, 0);

    const AnchorMidCurve1 = new Two.Anchor(endX, startY + height, 0, 0, (lengthtest * 1) / 5, 0);

    const AnchorMidCurve2 = new Two.Anchor(
      endX + lengthtest / 4,
      startY,
      (this.length * 1) / 5,
      0,
      0,
      0,
    );

    const AnchorEndBranchAfterTakeOver = new Two.Anchor(
      endX,
      this.parentBranch?.getYAtX(startX),
      0,
      0,
      0,
      0,
    );

    const AnchorArray: Anchor[] = [];

    AnchorArray.push(AnchorStartCurve1);
    AnchorArray.push(AnchorStartCurve2);
    AnchorArray.push(AnchorStartStraight);
    if (!this.checkBranchLongerThanParent()) {
      AnchorArray.push(AnchorEndStraight);
      AnchorArray.push(AnchorEndCurve1);
      AnchorArray.push(AnchorEndCurve2);
    } else {
      AnchorArray.push(AnchorMidStraight);
      AnchorArray.push(AnchorMidCurve1);
      AnchorArray.push(AnchorMidCurve2);
    }

    const branch = new Two.Path(AnchorArray, false, true, false);

    this.two.add(branch as any);

    return branch;
  }

  /**
   * Returns the y-coordinate of this branch at a given x-coordinate.
   * If the x is not on the line, it returns null.
   */
  getYAtX(x: number): number | undefined {
    const length = this.end - this.start;
    const percentage = x / length;
    const y = this.path?.getPointAt(percentage)?.y;
    return y;
  }

  /** This will render the Branch you created with all Subbranches */
  render(height?: number) {
    if (!this.parentBranch?.path) {
      this.path = this.two.makeLine(
        this.parentBranch ? this.parentBranch.path.vertices[0].x + this.start : this.start,
        height ? height : 0,
        this.parentBranch ? this.parentBranch.path.vertices[0].x + this.end : this.end,
        height ? height : 0,
      );
      this.path.stroke = "#000";
      this.path.linewidth = 4;
    } else {
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

    this.branches.forEach(branch => {
      console.log(branch.orientation);
      branch.render(
        branch.orientation
          ? this.path.vertices[0].y - branch.layerWidth
          : this.path.vertices[0].y + branch.layerWidth,
      );
    });
  }

  private setParentBranch(parent: Branch) {
    this.parentBranch = parent;
  }

  private checkBranchLongerThanParent() {
    if (!this.parentBranch?.end) return;

    if (this.parentBranch.end! > this.end) {
      return false;
    } else {
      return true;
    }
  }

  private autoSetLayerWidth(layerWidth: number) {
    this.layerWidth = layerWidth;
    if (
      (this.orientation == false && this.parentBranch?.orientation == true) ||
      (this.orientation == true && this.parentBranch?.orientation == false)
    ) {
      console.log("changed Layerwidth on: " + this);
      this.parentBranch?.autoSetLayerWidth(layerWidth * 2);
    }
  }

  getpath() {
    return this.path;
  }

  getBranches() {
    return this.branches;
  }

  getLayerWidth() {
    return this.layerWidth;
  }
  getOrientation() {
    return this.orientation;
  }
}
