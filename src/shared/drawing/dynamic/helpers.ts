import { Viewport } from "pixi-viewport";
import { ButterflyCell } from "@/shared/structures/Butterfly";
import type { ChronicleView } from "../../../../electron/ipc/contracts";
import type { Entity } from "../../../../electron/db/schema";

export type ChronicleCell = ButterflyCell<{
  id: string;
  knots: { start: number; end: number };
}>;

export interface DrawingContext {
  viewport: Viewport;
  aknot: number;
  distance: number;
  worldWidth: number;
  centerY: number;
}

export interface ActivePopup {
  chronicleData: ChronicleView | undefined;
  linkedEntities: Entity[];
  chronicleId: string | undefined;
  worldX: number;
  worldY: number;
  isAbove: boolean;
}

export interface BranchLabelEntity {
  id: string;
  name: string;
  domain?: string;
  avatar?: string;
}

export interface BranchLabel {
  id: string;
  chronicleId?: string;
  text: string;
  worldStartX: number;
  worldEndX: number;
  worldY: number;
  isAbove: boolean;
  entities: BranchLabelEntity[];
}

export const normalize = (
  knots: { start: number; end: number },
  aKnot: number,
  distance: number,
) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots.start - aKnot) / distance;
  normalizedKnots[1] = (knots.end - aKnot) / distance;
  return normalizedKnots;
};
