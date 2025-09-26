"use client";
import * as PIXI from "pixi.js";
import React from "react";

interface BranchProps {
  start: number;
  end: number;
  shift: number;
  thickness?: number;
  color?: number;
  title?: string;
}

const Branch: React.FC<BranchProps> = ({
  start,
  end,
  shift,
  thickness = 2,
  color = 0x00000,
  title,
}) => {
  const width = window.innerWidth;

  const draw = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.moveTo(start, shift);
      g.lineTo(start, shift);
      g.lineTo(end, shift);
      g.stroke({ width: 2, color: 0x00000 });

      // Add text to make branches debuggable
      if (title) {
        const text = new PIXI.Text({ text: title, scale: 0.5 });
        text.x = start;
        text.y = shift + 10;
        g.addChild(text);
      }
    },
    [start, end, shift, thickness, color, title],
  );

  return <pixiGraphics draw={draw} />;
};

export default Branch;
