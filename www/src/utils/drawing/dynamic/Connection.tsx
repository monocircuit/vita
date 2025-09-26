"use client";

import { Graphics as PixiGraphics, Text } from "pixi.js";
import React from "react";

interface Point {
  x: number;
  y: number;
}

interface ConnectionProps {
  startPoint: Point;
  endPoint: Point;
  thickness?: number;
  color?: number;
}

const Connection: React.FC<ConnectionProps> = ({
  startPoint,
  endPoint,
  thickness = 2,
  color = 0x000000,
}) => {
  const draw = React.useCallback(
    (g: PixiGraphics) => {
      g.clear();
      g.moveTo(startPoint.x, startPoint.y);

      // Control points for a horizontal S-curve from left to right
      const midX = startPoint.x + (endPoint.x - startPoint.x) / 2;
      const cp1 = { x: midX, y: startPoint.y };
      const cp2 = { x: midX, y: endPoint.y };

      g.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, endPoint.x, endPoint.y);
      g.stroke({ width: thickness, color: color });
    },
    [startPoint, endPoint, thickness, color],
  );

  return <pixiGraphics draw={draw} />;
};

export default Connection;
