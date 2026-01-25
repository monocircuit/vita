import * as PIXI from "pixi.js";

interface TimeLineProps {
  start: number;
  end: number;
  y: number;
}

export const drawTimeLine = (
  container: PIXI.Container,
  { start, end, y }: TimeLineProps,
) => {
  const graphics = new PIXI.Graphics();
  graphics.moveTo(start, y);
  graphics.lineTo(end, y);
  graphics.stroke({ width: 2, color: 0x888888 });
  
  
  container.addChild(graphics);
  return graphics;
};
