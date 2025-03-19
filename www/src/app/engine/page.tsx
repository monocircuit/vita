"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";

import scss from "./page.module.scss";
import displayBezierControls from "@/utils/functions/engine/displayBezierControls";

const Engine = () => {
    const engine = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!engine.current) return;
        const two = new Two({
            fullscreen: true,
            type: Two.Types.svg,
        }).appendTo(engine.current);

        const anchors = [
            new Two.Anchor(
                100,
                300, // Startpunkt
                0,
                0, // Kontrollpunkt 1
                400,
                500, // Kontrollpunkt 2
                Two.Commands.curve // Bezier-Befehl
            ),
            new Two.Anchor(
                700,
                30, // Endpunkt
                0,
                0, // Kontrollpunkt 1
                0,
                0, // Kontrollpunkt 2
                Two.Commands.curve // Bezier-Befehl
            ),
        ];

        anchors.forEach((anchor) => (anchor.relative = false));

        const path = new Two.Path(anchors, false, false, true);
        path.stroke = "#000";
        path.linewidth = 2;
        path.noFill();
        displayBezierControls(two, path);
        two.add(path);

        two.update();
    }, []);

    return <div className={scss["engine"]} ref={engine}></div>;
};

export default Engine;
