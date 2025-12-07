import { Viewport } from "pixi-viewport";
import { ButterflyCell } from "@/utils/structures/Butterfly";

// Konfiguration
export const CONNECTION_COLOR = 0x000000;
export const CONNECTION_THICKNESS = 4;
export const BRANCH_COLOR = 0x000000;
export const BRANCH_THICKNESS = 4;
export const LAYER_DISTANCE = 30; // Abstand zwischen Layern in Pixeln
export const MAX_SIBLING_PIXEL_GAP = 10;

export type ChronicleCell = ButterflyCell<{
  id: string;
  knots: { start: number; end: number };
}>;

export type DrawingContext = {
  viewport: Viewport;
  aknot: number;
  distance: number;
  screenWidth: number;
  centerY: number;
};

export const normalize = (
  knots: { start: number; end: number },
  aKnot: number,
  distance: number
) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots.start - aKnot) / distance;
  normalizedKnots[1] = (knots.end - aKnot) / distance;
  return normalizedKnots;
};