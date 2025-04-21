"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";
import scss from "./page.module.scss";
import { Branch } from "@/utils/engine/treeAPI";
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

        two.scene.translation.set(0, height / 2);

        const tree = new Branch(two, 50, 450);
        const branch1 = new Branch(two, 50, 200);
        const branch2 = new Branch(two, 50, 200);

        tree.addBranch(branch1, false);
        branch1.addBranch(branch2);

        

        tree.render();
        console.log(tree.getMainBranch());

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
