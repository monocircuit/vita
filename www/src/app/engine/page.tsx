"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";
import scss from "./page.module.scss";
import { Tree } from "@/utils/engine/treeAPI";
import displayBezierControls from "@/utils/engine/displayBezierControls";

const Engine = () => {
    const engine = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!engine.current) return;

        // Set fixed dimensions for better coordinate control
        const width = 800;
        const height = 600;

        const two = new Two({
            width: width,
            height: height,
            autostart: true,
        }).appendTo(engine.current);

        const tree = new Tree(two, 50);

        // Create main branch (vertical trunk)
        tree.createMainBranch([
            { x: 50, y: 200 }, // Top
            { x: 350, y: 200 }, // Bottom
        ]);

        tree.addBranch(0, 100, "#000", false); // Add a branch to the top
        console.log(tree.getBranches()[0]);
        tree.getBranches()[0].addBranch(0, 50, "#000"); // Add a branch to the top of the first branch
        console.log(tree.getBranches()[0].getBranches()[0]);

        two.update();
    }, []);

    return (
        <div
            className={scss["engine"]}
            ref={engine}
            style={{
                width: "100%",
                height: "100vh",
                background: "#f0f0f0",
            }}
        ></div>
    );
};

export default Engine;
