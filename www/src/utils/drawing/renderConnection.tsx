"use client";

import { Graphics as PixiGraphics } from 'pixi.js';
import React from 'react';

type Point = {
    x: number;
    y: number;
};

type RenderConnectionProps = {
    startPoint: Point;
    endPoint: Point;
    thickness?: number;
    color?: number;
};

const RenderConnection: React.FC<RenderConnectionProps> = ({ startPoint, endPoint, thickness = 2, color = 0x000000 }) => {

    const draw = React.useCallback((g: PixiGraphics) => {
        g.clear();
        g.moveTo(startPoint.x, startPoint.y);


    }, [startPoint, endPoint, thickness, color]);

    return <pixiGraphics draw={draw} />;
};

export default RenderConnection;