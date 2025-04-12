import Two from "two.js";

type Point = {
    x: number;
    y: number;
};

export class Tree {
    private two: Two;
    private layerWidth: number;
    private mainBranch: Two.Path | null = null;
    private branches: Tree[] = [];

    constructor(two: Two, layerWidth: number) {
        this.two = two;
        this.layerWidth = layerWidth;
    }

    createMainBranch(pathPoints: Point[]): Two.Path {
        // Create a simple straight line for main branch
        const start = pathPoints[0];
        const end = pathPoints[pathPoints.length - 1];
        this.mainBranch = this.two.makeLine(start.x, start.y, end.x, end.y);
        this.mainBranch.stroke = "#000";
        this.mainBranch.linewidth = 4;
        return this.mainBranch;
    }

    addBranchTop(from: number, to: number) {
        const newMainBranch = new Tree(this.two, this.layerWidth / 2);
        console.log(this.mainBranch);
        newMainBranch.mainBranch = newMainBranch.two.makeLine(
            this.mainBranch.vertices[0].x + from,
            this.mainBranch.vertices[0].y - this.layerWidth,
            this.mainBranch.vertices[0].x + to,
            this.mainBranch.vertices[0].y - this.layerWidth
        );
        newMainBranch.mainBranch.stroke = "#000";
        newMainBranch.mainBranch.linewidth = 2;
        this.branches.push(newMainBranch);
    }
    
    addBranchBottom(from: number, to: number) {
        const newMainBranch = new Tree(this.two, this.layerWidth / 2);
        newMainBranch.mainBranch = newMainBranch.two.makeLine(
            this.mainBranch.vertices[0].x + from,
            this.mainBranch.vertices[0].y + this.layerWidth,
            this.mainBranch.vertices[0].x + to,
            this.mainBranch.vertices[0].y + this.layerWidth
        );
        newMainBranch.mainBranch.stroke = "#000";
        newMainBranch.mainBranch.linewidth = 2;
        this.branches.push(newMainBranch);
    }

    getBranches() {
        return this.branches;
    }
}
