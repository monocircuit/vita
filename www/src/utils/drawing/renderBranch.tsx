"use client"
import * as PIXI from 'pixi.js';
import React from 'react';

type renderBranchProps = {
    start: number;
    end: number;
    shift: number;
    thickness?: number;
    color?: number;
};

const RenderBranch: React.FC<renderBranchProps> = ({ start, end, shift, thickness = 2, color = 0x00000 }) => {

    const width = window.innerWidth;
    const y = window.innerHeight / 2;


    const draw = React.useCallback((g: PIXI.Graphics) => {
        g.clear()
        g.moveTo(start, y + shift)
        g.lineTo(start, y + shift);
        g.lineTo(end, y + shift);
        g.stroke({ width: 2, color: 0x00000 })
    }, [start, end, shift, thickness, color]);

    return <pixiGraphics draw={draw} />;
};

export default RenderBranch;
