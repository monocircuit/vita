import * as PIXI from "pixi.js";
import { registerRestroke } from "./lineScaleManager";
import { BRANCH } from "./config";

interface BranchProps {
  start: number;
  end: number;
  shift: number;
  thickness?: number;
  color?: number;
  /** Whether to draw a dot at the start endpoint (default true). False when a connection line meets here. */
  drawStartDot?: boolean;
  /** Whether to draw a dot at the end endpoint (default true). False when a connection line meets here. */
  drawEndDot?: boolean;
}

export interface DrawBranchResult {
  graphics: PIXI.Graphics;
  /** Re-render the branch with new color/thickness without destroying the Graphics object. */
  restyle: (color: number, thickness: number) => void;
}

const POINT_EPSILON_WORLD = 0.0001;
const POINT_RADIUS_FACTOR = 1.6;
const POINT_MIN_RADIUS_SCREEN = 3;

export const drawBranch = (
  container: PIXI.Container,
  { start, end, shift, thickness = 2, color = 0x000000, drawStartDot = true, drawEndDot = true }: BranchProps,
): DrawBranchResult => {
  const graphics = new PIXI.Graphics();

  let currentColor = color;
  let currentThickness = thickness;

  // scale = viewport.scale.x (horizontal zoom). scale.y is always 1, so
  // world-space Y values map 1:1 to screen pixels — no Y compensation needed.
  // Only X radii need dividing by scale so circles stay round.
  const restroke = (scale: number) => {
    if (graphics.destroyed) return;
    graphics.clear();

    const lineStart = Math.min(start, end);
    const lineEnd = Math.max(start, end);
    const span = lineEnd - lineStart;

    if (span <= POINT_EPSILON_WORLD) {
      const targetRadius = Math.max(
        POINT_MIN_RADIUS_SCREEN,
        currentThickness * POINT_RADIUS_FACTOR,
      );
      graphics.ellipse(lineStart, shift, targetRadius / scale, targetRadius);
      graphics.fill({ color: currentColor });
      return;
    }

    const dotRadius = currentThickness * BRANCH.DOT_RADIUS_FACTOR;
    const lineWidth = currentThickness / BRANCH.LINE_THICKNESS_DIVISOR;

    // Thin connecting line (drawn first so dots overlap on top)
    graphics.moveTo(lineStart, shift);
    graphics.lineTo(lineEnd, shift);
    graphics.stroke({ width: lineWidth, color: currentColor, cap: "butt" });

    // Endpoint dots — ellipse compensates for horizontal-only scale
    if (drawStartDot) {
      graphics.ellipse(lineStart, shift, dotRadius / scale, dotRadius);
      graphics.fill({ color: currentColor });
    }
    if (drawEndDot) {
      graphics.ellipse(lineEnd, shift, dotRadius / scale, dotRadius);
      graphics.fill({ color: currentColor });
    }
  };

  const restyle = (newColor: number, newThickness: number) => {
    currentColor = newColor;
    currentThickness = newThickness;
    restroke(container.scale.x || 1);
  };

  restroke(container.scale.x || 1);
  registerRestroke(restroke);

  // Wider invisible hit area so branches are easy to hover/click
  const HIT_PADDING = 32;
  const minX = Math.min(start, end);
  const maxX = Math.max(start, end);
  const hitWidth = Math.max(maxX - minX, 16);
  graphics.hitArea = new PIXI.Rectangle(
    minX - (hitWidth - (maxX - minX)) / 2,
    shift - HIT_PADDING,
    hitWidth,
    HIT_PADDING * 2,
  );

  container.addChild(graphics);

  return { graphics, restyle };
};
