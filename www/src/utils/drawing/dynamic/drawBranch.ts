import * as PIXI from "pixi.js";

interface BranchProps {
  start: number;
  end: number;
  shift: number;
  thickness?: number;
  color?: number;
  title?: string;
}

export const drawBranch = (
  container: PIXI.Container,
  {
    start,
    end,
    shift,
    thickness = 2,
    color = 0x000000,
    title,
  }: BranchProps,
) => {
  const graphics = new PIXI.Graphics();
  graphics.moveTo(start, shift);
  graphics.lineTo(end, shift);
  graphics.stroke({ width: thickness, color: color });

  if (title) {
    const text = new PIXI.Text({
      text: title,
      style: new PIXI.TextStyle({
        fontSize: 14,
        fill: 0x000000,
      }),
    });
    text.x = start;
    text.y = shift + 10;
    graphics.addChild(text);
  }

  container.addChild(graphics);
};