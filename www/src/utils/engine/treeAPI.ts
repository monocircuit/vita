import { start } from "node:repl";
import Two from "two.js";
import displayBezierControls from "./displayBezierControls";

type Point = {
    x: number;
    y: number;
};

export class Tree {
    private two: Two;
    private layerWidth: number;
    private mainBranch: Two.Path | null = null;
    private parentBranch: Tree | null = null;
    private branches: Tree[] = [];
    private start: Point;
    private end: Point;
    private color: string = "#000";


    constructor(two: Two, start: Point, end: Point, layerWidth: number) {
        this.two = two;
        this.start = start;
        this.end = end;
        this.layerWidth = layerWidth;
    }

    setParentBranch(parent: Tree) {
        this.parentBranch = parent;
    }

    autoSetLayerWidth(layerWidth: number) {
        this.layerWidth = layerWidth;
        this.parentBranch?.autoSetLayerWidth(layerWidth);

    }

    getLayerWidth() {
        return this.layerWidth;
    }

    addBranch(from: number, to: number, color: string = "#000", orientation: boolean = true) {
        if (from > to) {
            throw new Error("Adding Branch: From value must be less than to value.");
        }

        const newMainBranch = new Tree(this.two, this.layerWidth);
        newMainBranch.setParentBranch(this);
        newMainBranch.autoSetLayerWidth(newMainBranch.layerWidth * 2);

        const lengthBranch = to - from;
        console.log("Adding Branch LayerWidth: " + newMainBranch.layerWidth)

        newMainBranch.mainBranch = this.two.makeLine(
            this.mainBranch.vertices[0].x + from + (lengthBranch * 1) / 4,
            orientation ? this.mainBranch.vertices[0].y - this.layerWidth : this.mainBranch.vertices[0].y + this.layerWidth,
            this.mainBranch.vertices[0].x + to,
            orientation ? this.mainBranch.vertices[0].y - this.layerWidth : this.mainBranch.vertices[0].y + this.layerWidth
        );

        const startAnchor = new Two.Anchor(
            this.mainBranch.vertices[0].x + from,
            this.mainBranch.vertices[0].y,
            0,
            0,
            lengthBranch * 1 / 5,
            0
        );
        const endAnchor = new Two.Anchor(
            newMainBranch.mainBranch.vertices[0].x,
            newMainBranch.mainBranch.vertices[0].y,
            -lengthBranch * 1 / 5,
            0,
            0,
            0
        );

        const startCurve = new Two.Path([startAnchor, endAnchor], false, true, false);
        startCurve.stroke = color;
        startCurve.linewidth = 2;
        startCurve.noFill();

        displayBezierControls(startCurve);

        newMainBranch.two.add(startCurve as any);

        //Set Color and line thickness
        newMainBranch.mainBranch.stroke = color;
        newMainBranch.mainBranch.linewidth = 2;

        //Add the new branch to the branches array
        this.branches.push(newMainBranch);
    }


    render(start:Point, end:Point) {
        this.mainBranch = this.two.makeLine(start, start.y, end.x, end.y);
    }



    getBranches() {
        return this.branches;
    }







}


