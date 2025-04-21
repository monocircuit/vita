import Two from "two.js";
import displayBezierControls from "./displayBezierControls";

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

    constructor(two: Two, start: number, end: number, layerWidth?: number) {
        this.two = two;
        this.start = start;
        this.end = end;
        this.layerWidth = layerWidth ? layerWidth : 50;
    }

    setParentBranch(parent: Branch) {
        this.parentBranch = parent;
    }

    autoSetLayerWidth(layerWidth: number) {
        this.layerWidth = layerWidth;
        this.parentBranch?.autoSetLayerWidth(layerWidth *2);
    }

    getLayerWidth() {
        return this.layerWidth;
    }


    
    addBranch(branch: Branch, orientation?: boolean) {
        branch.setParentBranch(this);
        orientation!=null ? branch.orientation = orientation! : null;
        this.branches.push(branch);
    }

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

            this.two.add(startCurve as any);
        }

        this.branches.forEach((branch) => {
            console.log(branch.orientation)
            branch.render(
                branch.orientation
                    ? this.mainBranch.vertices[0].y - this.layerWidth
                    : this.mainBranch.vertices[0].y + this.layerWidth
            );
        });
    }

    getMainBranch() {
        return this.mainBranch;
    }

    getBranches() {
        return this.branches;
    }
}
