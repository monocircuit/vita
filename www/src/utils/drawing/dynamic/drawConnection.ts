import * as PIXI from "pixi.js";

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

export const drawConnection = (
  container: PIXI.Container,
  {
    startPoint,
    endPoint,
    thickness = 2,
    color = 0x000000,
  }: ConnectionProps,
) => {
  const graphics = new PIXI.Graphics();
  graphics.moveTo(startPoint.x, startPoint.y);

  const midX = startPoint.x + (endPoint.x - startPoint.x) / 2;
  const cp1 = { x: midX, y: startPoint.y };
  const cp2 = { x: midX, y: endPoint.y };

  graphics.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, endPoint.x, endPoint.y);
  graphics.stroke({ width: thickness, color: color });

  container.addChild(graphics);
};