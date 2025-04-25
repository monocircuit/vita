import Two from "two.js";
import displayBezierControls from "./displayBezierControls";
import { get } from "http";

type Point = {
    x: number;
    y: number;
};

export class Branch {
    private two: Two;
    private layerWidth: number;
    private mainBranch: Two.Path | null = null;
    private parentBranch: Branch | null = null;
    private branches: Branch[] = [];
    private start: number;
    private end: number;
    private orientation: boolean = true;
    private color: string = "#000";

    /** You need to give the Two.js Enviroment, a start and end coordinate on the x-axis
     * and if you want a seperate Layerwitdth if you want to lock it for a branch   */
    constructor(two: Two, start: number, end: number, layerWidth?: number) {
        this.two = two;
        this.start = start;
        this.end = end;
        this.layerWidth = layerWidth ? layerWidth : 50;
    }

    /** With addBranch you can add a created Branch to an existing one */
    addBranch(branch: Branch, orientation?: boolean, autoSetLayerWidth: boolean = true) {
        branch.setParentBranch(this);
        orientation != null ? (branch.orientation = orientation!) : null;

        if (autoSetLayerWidth) {
            console.log("Layers automatically Set");
            branch.autoSetLayerWidth(branch.layerWidth);
        } else {
            console.log("Layers didn´t changed");
        }

        this.branches.push(branch);
    }

    private createBranch(height: number) {
        const lengthBranch = this.end - this.start;
        const startX = this.parentBranch?.mainBranch.vertices[0].x + this.start - lengthBranch / 5;
        const endX = this.parentBranch?.mainBranch.vertices[0].x + this.end + lengthBranch / 5;

        const AnchorStartCurve1 = new Two.Anchor(
            startX,
            this.parentBranch?.getYAtX(this.start),
            0,
            0,
            (lengthBranch * 1) / 5,
            0
        );
        const AnchorStartCurve2 = new Two.Anchor(
            startX + (lengthBranch * 1) / 4,
            this.parentBranch?.getYAtX(this.start)! + height,
            (-lengthBranch * 1) / 5,
            0,
            0,
            0
        );
        const AnchorStartBranch = new Two.Anchor(
            startX + (lengthBranch * 1) / 4,
            this.parentBranch?.getYAtX(this.start)! + height,
            0,
            0,
            0,
            0
        );

        const AnchorEndBranch = new Two.Anchor(
            startX + this.end,
            this.parentBranch?.getYAtX(this.start)! + height,
            0,
            0,
            0,
            0
        );

        const AnchorMidBranch = new Two.Anchor(
            this.parentBranch?.mainBranch.vertices[1].x,
            this.parentBranch?.getYAtX(startX)! + height,
            0,
            0,
            (lengthBranch * 1) / 5,
            0
        );

        const AnchorMidCurve = new Two.Anchor(
            this.parentBranch?.mainBranch.vertices[1].x + (lengthBranch * 1) / 4,
            this.parentBranch?.mainBranch.vertices[0].y,
            (lengthBranch * 1) / 5,
            0,
            0,
            0
        );

        const AnchorEndBranchAfterTakeOver = new Two.Anchor(
            endX,
            this.parentBranch?.getYAtX(startX),
            0,
            0,
            0,
            0
        );

        const branch = new Two.Path(
            [AnchorStartCurve1, AnchorStartCurve2, AnchorStartBranch, AnchorEndBranch],
            false,
            true,
            false
        );

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
        const y = this.mainBranch?.getPointAt(percentage)?.y;
        return y;
    }

    /** This will render the Branch you created with all Subbranches */
    render(height?: number) {
        if (!this.parentBranch?.mainBranch) {
            this.mainBranch = this.two.makeLine(
                this.parentBranch
                    ? this.parentBranch.mainBranch.vertices[0].x + this.start
                    : this.start,
                height ? height : 0,
                this.parentBranch
                    ? this.parentBranch.mainBranch.vertices[0].x + this.end
                    : this.end,
                height ? height : 0
            );
            this.mainBranch.stroke = "#000";
            this.mainBranch.linewidth = 4;
        } else {
            const lengthBranch = this.end - this.start;

            this.mainBranch = this.createBranch(height ? height : 0);
            this.mainBranch.stroke = "#000";

            this.mainBranch.linewidth = 4;
            this.mainBranch.noFill();

            /* //upcoming changes maybe try to move each action like creation of Branch in a different function
            this.mainBranch = this.two.makeLine(
                this.parentBranch
                    ? this.parentBranch.mainBranch.vertices[0].x +
                          this.start +
                          (lengthBranch * 1) / 4
                    : this.start,
                height ? height : 0,
                this.parentBranch
                    ? this.parentBranch.mainBranch.vertices[0].x + this.end
                    : this.end,
                height ? height : 0
            );
            this.mainBranch.stroke = "#000";
            this.mainBranch.linewidth = 4;

            const startAnchor = new Two.Anchor(
                this.parentBranch.mainBranch.vertices[0].x + this.start,
                this.parentBranch.mainBranch.vertices[0].y,
                0,
                0,
                (lengthBranch * 1) / 5,
                0
            );
            const endAnchor = new Two.Anchor(
                this.mainBranch.vertices[0].x,
                this.mainBranch.vertices[0].y,
                (-lengthBranch * 1) / 5,
                0,
                0,
                0
            );

            const startCurve = new Two.Path([startAnchor, endAnchor], false, true, false);
            startCurve.linewidth = 4;
            startCurve.noFill();

            this.two.add(startCurve as any); */
        }

        this.branches.forEach((branch) => {
            console.log(branch.orientation);
            branch.render(
                branch.orientation
                    ? this.mainBranch.vertices[0].y - branch.layerWidth
                    : this.mainBranch.vertices[0].y + branch.layerWidth
            );
        });
    }

    private setParentBranch(parent: Branch) {
        this.parentBranch = parent;
    }

    private checkBranchLongerThanParent() {
        if (this.parentBranch?.mainBranch.vertices[1].x > this.mainBranch?.vertices[1].x) {
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

    getMainBranch() {
        return this.mainBranch;
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
