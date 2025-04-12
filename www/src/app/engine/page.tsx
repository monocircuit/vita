"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";
import scss from "./page.module.scss";
import { TreeBuilder } from "@/utils/engine/treeAPI";

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
            autostart: true
        }).appendTo(engine.current);

        two.scene.translation.set(width/2, height/2);

        const tree = new TreeBuilder(two, 50);

        // Create main branch (vertical trunk)
        tree.createMainBranch([
            { x: 250, y: 0 },  // Top
            { x: -250, y: 0 }    // Bottom
        ]);

        tree.addBranch(150)

        two.update();
    }, []);

    return <div className={scss["engine"]} ref={engine} style={{
        width: '100%',
        height: '100vh',
        background: '#f0f0f0'
    }}></div>;
};

export default Engine;