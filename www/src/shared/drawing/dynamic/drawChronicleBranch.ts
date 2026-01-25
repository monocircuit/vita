import { drawBranch } from "@/shared/drawing/dynamic/drawBranch";
import { normalize } from "./helpers";
import { connectionEndpointX, connectionStartpointX } from "./endpoints";
import {
  getGlobalConfig,
  getBranchStyle,
  subscribeBranch,
  subscribeGlobal,
} from "./styleApi";
import { ChronicleCell } from "./helpers";
import type { DrawingContext } from "./helpers";
import { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { drawContainer } from "./components/drawContainer";
import { NormalizedRowFor } from "@/shared/tanstack/reader/types";

/**
 Die Registry speichert für jede gezeichnete Chronicle-Branch die zugehörigen
 Informationen, damit falls eine Kontextänderung stattfindet, der einzelne Branch neu gerendert werden kann.
 */
const branchRegistry = new Map<
  string,
  {
    gfx: Graphics;
    chronicle: ChronicleCell;
    levelIndex: number;
    context: DrawingContext;
    unsubscribeBranch?: () => void;
    unsubscribeGlobal?: () => void;
  }
>();

let activePopupContainer: Container | null = null;

export const drawChronicleBranch = (
  context: DrawingContext,
  chronicle: ChronicleCell,
  levelIndex: number,
  chronicleData?: NormalizedRowFor<"chronicles">
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;
  const id = String(chronicle.$?.id ?? `${Math.random()}`);

  // Helper to compute start/end/shift
  const computeGeometry = () => {
    const nknots = normalize(chronicle.$.knots, aknot, distance);
    let start = nknots[0] * screenWidth;
    let end = nknots[1] * screenWidth;

    // adapt endpoints where branches connect
    if (chronicle.next && chronicle.next.$) {
      end = connectionStartpointX(
        nknots[0] * screenWidth,
        nknots[1] * screenWidth,
      );
    }
    if (chronicle.prev && chronicle.prev.$) {
      start = connectionEndpointX(
        nknots[0] * screenWidth,
        nknots[1] * screenWidth,
      );
    }

    const cfg = getGlobalConfig();
    const shift = centerY - levelIndex * cfg.layerDistance;
    return { start, end, shift };
  };

  // Create initial gfx
  const initialCfg = getGlobalConfig();
  const override = chronicle.$?.id
    ? getBranchStyle(String(chronicle.$.id))
    : undefined;
  const color = override?.color ?? initialCfg.branchColor;
  const thickness = override?.thickness ?? initialCfg.branchThickness;
  const geom = computeGeometry();

  // drawBranch should return the Graphics object
  const gfx = drawBranch(viewport, {
    start: geom.start,
    end: geom.end,
    shift: geom.shift,
    title: chronicle.$.id,
    color,
    thickness,
  });

  const onClickFunction = (e: FederatedPointerEvent) => {
    // Stop the click from passing through to the viewport (optional)
    e.stopPropagation();

    // 1. Remove existing popup if one exists
    if (activePopupContainer) {
      activePopupContainer.destroy({ children: true });
      activePopupContainer = null;
    }

    // 2. Create a NEW container specifically for this popup
    const popup = new Container();
    // Add it to the viewport so it moves with the zoom/pan
    context.viewport.addChild(popup);
    activePopupContainer = popup;

    // 3. Determine Direction
    // If levelIndex is POSITIVE, the branch is in the UPPER half. We want popup ABOVE it.
    // If levelIndex is NEGATIVE, the branch is in the LOWER half. We want popup BELOW it.
    const isUpperHemisphere = levelIndex > 0;

    // "center-bottom" means the box pivots at its bottom (grows upwards)
    // "center-top" means the box pivots at its top (grows downwards)
    const origin = isUpperHemisphere ? "center-bottom" : "center-top";

    // Add a small offset so it doesn't touch the line exactly
    const yOffset = isUpperHemisphere ? -15 : 15;

    drawContainer(popup, {
      // Position at the center of the branch
      x: (geom.start + geom.end) / 2,
      y: geom.shift + yOffset,
      width: 200,
      // height is optional, it will auto-scale
      title: `${chronicleData?.title ?? "Chronicle " + chronicle.$?.id}`,
      content: `${chronicleData?.description ?? "No description available."}`,
      contentType: "text",
      origin: origin, // <--- Passes the calculated origin
      styles: {
        backgroundColor: 0xffffff,
        padding: 10,
      },
    });
  };

  gfx.interactive = true;
  gfx.onclick = (e) => onClickFunction(e);

  // store in registry
  const entry = {
    gfx,
    chronicle,
    levelIndex,
    context,
    unsubscribeBranch: undefined as any,
    unsubscribeGlobal: undefined as any,
  };
  branchRegistry.set(id, entry);

  // redraw function: replace old gfx with a new one (keeps this local so we can call it on updates)
  const redraw = () => {
    // compute new geometry & style
    const g = branchRegistry.get(id);
    if (!g) return;
    const { viewport: vp } = g.context;
    const geom = computeGeometry();
    const override = g.chronicle.$?.id
      ? getBranchStyle(String(g.chronicle.$.id))
      : undefined;
    const cfg = getGlobalConfig();
    const color = override?.color ?? cfg.branchColor;
    const thickness = override?.thickness ?? cfg.branchThickness;

    // remove old gfx
    try {
      if (g.gfx.parent) g.gfx.parent.removeChild(g.gfx);
      g.gfx.destroy({ children: true, texture: false });
    } catch (e) {
    }

    const newGfx = drawBranch(vp, {
      start: geom.start,
      end: geom.end,
      shift: geom.shift,
      title: g.chronicle.$.id,
      color,
      thickness,
    });
    newGfx.interactive = true;
    newGfx.onclick = (e) => onClickFunction(e);

    g.gfx = newGfx;
    branchRegistry.set(id, g);
  };

  // In diesen Funktionen wird redraw() aufgerufen bei Stil- oder Kontextänderungen.
  const unsubBranch = subscribeBranch(id, () => {
    redraw();
  });
  //Speicherung der Unsubscribe-Funktion im Falle einer späteren Löschung
  entry.unsubscribeBranch = unsubBranch;
  // globale Changes wie layerDistance
  const unsubGlobal = subscribeGlobal(() => {
    redraw();
  });
  entry.unsubscribeGlobal = unsubGlobal;

  // Return an unsubscribe / cleanup function in case caller wants to unregister later.
  return () => {
    const e = branchRegistry.get(id);
    if (!e) return;
    e.unsubscribeBranch && e.unsubscribeBranch();
    e.unsubscribeGlobal && e.unsubscribeGlobal();
    try {
      if (e.gfx.parent) e.gfx.parent.removeChild(e.gfx);
      e.gfx.destroy({ children: true, texture: false });
    } catch (err) {}
    branchRegistry.delete(id);
  };
};
