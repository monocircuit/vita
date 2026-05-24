import { useEffect, RefObject, MutableRefObject } from "react";
import { Viewport } from "pixi-viewport";
import { NormalizedRowFor } from "@/shared/data/tanstack";
import { DrawingContext, ActivePopup } from "../helpers";
import {
  clearBranchRegistry,
  drawChronicleBranch,
} from "../drawChronicleBranch";
import { drawGenericConnection } from "../drawGenericConnection";
import { drawDraggableNote, FreeNoteData } from "../drawDraggableNote";
import { clearRestrokes } from "../lineScaleManager";
import { clearChains } from "../chainHoverManager";
import { clearLabels, batchLabels } from "../labelStore";
import { clearHalos } from "../branchHaloManager";
import { computeWorldScale } from "../worldScale";
import { ButterflyCell } from "@/shared/structures/Butterfly";
import Engine from "@/shared/processing/engines/dynamic/Engine";

export function useBranchRenderer(
  viewportRef: RefObject<Viewport | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  engine: Engine | undefined,
  chronicles: NormalizedRowFor<"chronicles">[] | undefined,
  entitiesByChronicleId: Map<string, NormalizedRowFor<"entities">[]>,
  notes: FreeNoteData[],
  onNoteMove: ((id: string, x: number, y: number) => void) | undefined,
  isReady: boolean,
  fitViewFnRef: MutableRefObject<(() => void) | null>,
  onPopup?: (popup: ActivePopup) => void,
) {
  useEffect(() => {
    if (
      !engine ||
      !engine.loaded ||
      !isReady ||
      !viewportRef.current ||
      !containerRef.current
    )
      return;

    const viewport = viewportRef.current;
    const container = containerRef.current;
    clearBranchRegistry();
    clearRestrokes();
    clearChains();
    clearLabels();
    clearHalos();
    viewport.removeChildren();

    const scale = computeWorldScale(chronicles);
    if (!scale) return;

    const drawingContext: DrawingContext = {
      viewport,
      aknot: scale.minMs,
      distance: scale.totalDurationMs,
      worldWidth: scale.worldWidth,
      centerY: container.clientHeight / 2,
    };

    // Collect all chronicle cells from the Butterfly
    const allChronicles: ButterflyCell<any>[] = [];
    const collectLevel = (lvl: number) => {
      const l = engine.getLevel(lvl);
      if (l) allChronicles.push(...l.toArray());
    };
    collectLevel(0);
    for (let i = 0; i < engine.yDimensions.positive; i++) collectLevel(i + 1);
    for (let i = 0; i < engine.yDimensions.negative; i++)
      collectLevel(-(i + 1));

    // Batch label store writes so React only re-renders once
    batchLabels(() => {
      // Draw branches
      allChronicles.forEach(chronicle => {
        if (chronicle) {
          const data = chronicles?.find(e => e.id === chronicle.$?.id);
          const linkedEntities =
            entitiesByChronicleId.get(String(chronicle.$?.id ?? "")) ?? [];
          drawChronicleBranch(
            drawingContext,
            chronicle,
            chronicle.y,
            data,
            linkedEntities,
            onPopup,
          );
        }
      });
    });

    // Draw connections (walk chains from head)
    allChronicles.forEach(startCell => {
      if (!startCell || startCell.prev) return;
      let curr = startCell;
      while (curr.next) {
        drawGenericConnection(drawingContext, curr, curr.next);
        curr = curr.next;
      }
    });

    // Draw notes
    notes.forEach(note => {
      drawDraggableNote(viewport, note, (id, x, y) => {
        if (onNoteMove) onNoteMove(id, x, y);
      });
    });

    fitViewFnRef.current?.();

    return () => {
      clearBranchRegistry();
      clearLabels();
      clearHalos();
    };
  }, [
    engine,
    engine?.loaded,
    notes,
    chronicles,
    entitiesByChronicleId,
    isReady,
  ]);
}
