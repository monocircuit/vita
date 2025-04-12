import Two from "two.js";

export class TreeBuilder {
    private two: Two;
    private layerWidth: number;
    private branches: { Path: Two.Path; Layer: number }[] = [];
    private mainBranch: Two.Path | null = null;

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
        this.branches.push(this.mainBranch);
        return this.mainBranch;
    }

    addBranch(from: number): Two.Path {
        let Layer: number = 0;
        Layer = this.setLayer(from, 250);

        const branch = this.two.makePath(from);
        console.log(this.mainBranch._collection[0]);
        branch.stroke = "#000";
        branch.linewidth = 2;
        this.branches.push({ Path: branch, Layer: Layer });
        return branch;
    }

    private setLayer(newXStart: number, newXEnd: number): number {
        let layer = 0;

        while (true) {
            const conflict = this.branches.some((branch) => {
                if (branch.Layer !== layer) return false;

                const existingBounds = branch.Path.getBoundingClientRect();
                const existingXStart = existingBounds.left;
                const existingXEnd = existingBounds.right;

                const isOverlapping = !(newXEnd < existingXStart || newXStart > existingXEnd);
                return isOverlapping;
            });

            if (!conflict) break;
            layer++;
        }

        return layer;
    }
}
