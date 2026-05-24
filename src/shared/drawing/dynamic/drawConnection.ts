import * as PIXI from "pixi.js";
import { registerRestroke } from "./lineScaleManager";
import { BRANCH } from "./config";

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

export interface DrawConnectionResult {
  graphics: PIXI.Graphics;
  restyle: (color: number, thickness: number) => void;
}

export const drawConnection = (
  container: PIXI.Container,
  { startPoint, endPoint, thickness = 2, color = 0x000000 }: ConnectionProps,
): DrawConnectionResult => {
  const graphics = new PIXI.Graphics();

  let currentColor = color;
  let currentThickness = thickness;

  const restroke = (scale: number) => {
    if (graphics.destroyed) return;
    graphics.clear();

    // Draw in a coordinate space where both axes have net scale 1 in screen space.
    // Setting graphics.scale.x = 1/scale cancels the viewport's scale.x, so local
    // x-coordinates become screen pixels directly. This makes stroke width truly
    // constant regardless of zoom direction or curve angle.
    graphics.scale.x = 1 / scale;

    const sx = startPoint.x * scale;
    const sy = startPoint.y; // scaleY = 1, world-Y = screen-Y
    const ex = endPoint.x * scale;
    const ey = endPoint.y;
    const midX = sx + (ex - sx) / 2;

    graphics.moveTo(sx, sy);
    graphics.bezierCurveTo(midX, sy, midX, ey, ex, ey);
    graphics.stroke({ width: currentThickness / BRANCH.LINE_THICKNESS_DIVISOR, color: currentColor });
  };

  const restyle = (newColor: number, newThickness: number) => {
    currentColor = newColor;
    currentThickness = newThickness;
    restroke(container.scale.x || 1);
  };

  restroke(container.scale.x || 1);
  registerRestroke(restroke);

  container.addChild(graphics);
  return { graphics, restyle };
};
