import {
  drawBranch,
  DrawBranchResult,
} from "@/shared/drawing/dynamic/drawBranch";
import { BRANCH, HALO, LABEL } from "./config";
import { normalize } from "./helpers";
import { connectionEndpointX, connectionStartpointX } from "./endpoints";
import { getGlobalConfig, subscribeBranch, subscribeGlobal } from "./styleApi";
import { getBranchBaseStyle, getBranchHoverStyle } from "./branchStyleHelpers";
import { ChronicleCell, ActivePopup, BranchLabelEntity } from "./helpers";
import type { DrawingContext } from "./helpers";
import * as PIXI from "pixi.js";
import { FederatedPointerEvent, Graphics } from "pixi.js";
import type { ChronicleView } from '@/shared/data/db';
import type { Entity } from '@/shared/data/db';
import {
  getChainId,
  registerChainMember,
  hoverChain,
  unhoverChain,
  isChainHovered,
} from "./chainHoverManager";
import { setLabel, removeLabel } from "./labelStore";
import { registerHalo } from "./branchHaloManager";
import { registerRestroke } from "./lineScaleManager";

/**
 Die Registry speichert für jede gezeichnete Chronicle-Branch die zugehörigen
 Informationen, damit falls eine Kontextänderung stattfindet, der einzelne Branch neu gerendert werden kann.
 */
const branchRegistry = new Map<
  string,
  {
    gfx: Graphics;
    restyle: DrawBranchResult["restyle"];
    chronicle: ChronicleCell;
    levelIndex: number;
    context: DrawingContext;
    chainId: string;
    unsubscribeBranch?: () => void;
    unsubscribeGlobal?: () => void;
    unregisterChain?: () => void;
  }
>();

export const clearBranchRegistry = () => {
  for (const [key, entry] of branchRegistry) {
    entry.unsubscribeBranch?.();
    entry.unsubscribeGlobal?.();
    entry.unregisterChain?.();

    try {
      if (entry.gfx.parent) entry.gfx.parent.removeChild(entry.gfx);
      entry.gfx.destroy({ children: true, texture: false });
    } catch {}

    branchRegistry.delete(key);
  }
};

export const drawChronicleBranch = (
  context: DrawingContext,
  chronicle: ChronicleCell,
  levelIndex: number,
  chronicleData?: ChronicleView,
  linkedEntities: Entity[] = [],
  onPopup?: (popup: ActivePopup) => void,
) => {
  const { viewport, aknot, distance, worldWidth, centerY } = context;
  const id = String(chronicle.$?.id ?? `${Math.random()}`);
  const registryKey = `${id}_${chronicle.x}_${chronicle.y}`;

  // Helper to compute start/end/shift
  const computeGeometry = () => {
    const nknots = normalize(chronicle.$.knots, aknot, distance);
    let start = nknots[0] * worldWidth;
    let end = nknots[1] * worldWidth;

    if (chronicle.next && chronicle.next.$) {
      end = connectionStartpointX(
        nknots[0] * worldWidth,
        nknots[1] * worldWidth,
      );
    }
    if (chronicle.prev && chronicle.prev.$) {
      start = connectionEndpointX(
        nknots[0] * worldWidth,
        nknots[1] * worldWidth,
      );
    }

    const cfg = getGlobalConfig();
    const shift = centerY - levelIndex * cfg.layerDistance;
    return { start, end, shift };
  };

  const chainId = getChainId(chronicle);
  const chronicleId = chronicle.$?.id ? String(chronicle.$.id) : undefined;
  const { color, thickness } = getBranchBaseStyle(chronicleId);
  const geom = computeGeometry();

  // ── Halo (selection highlight) ──────────────────────────────────────────────
  // Mutable geometry reference so the restroke always uses the latest positions.
  const geomRef = { start: geom.start, end: geom.end, shift: geom.shift };
  // Track the current branch thickness (updated by the hover animation via chain
  // membership) so the halo always sits exactly HALO.GAP pixels from the edge.
  let currentThickness = thickness;
  let haloGfx: PIXI.Graphics | null = null;
  let haloVisible = false;
  let unregHaloRestroke: (() => void) | null = null;
  let unregHaloManager: (() => void) | null = null;

  const applyHaloShape = (g: PIXI.Graphics, scale: number, thk: number) => {
    const px = HALO.PADDING_X / scale;
    // Half-height: scale.y is always 1, so no Y-division needed
    const py = thk * BRANCH.DOT_RADIUS_FACTOR + HALO.GAP;
    g.clear();
    g.roundRect(
      geomRef.start - px,
      geomRef.shift - py,
      Math.max(geomRef.end - geomRef.start, 1) + px * 2,
      py * 2,
      py,
    );
    g.fill({ color: getGlobalConfig().theme.haloColor, alpha: HALO.ALPHA });
  };

  const initHalo = () => {
    if (unregHaloRestroke) { unregHaloRestroke(); unregHaloRestroke = null; }
    if (haloGfx) {
      try {
        if (haloGfx.parent) haloGfx.parent.removeChild(haloGfx);
        haloGfx.destroy();
      } catch {}
    }

    const g = new PIXI.Graphics();
    g.visible = haloVisible;
    applyHaloShape(g, viewport.scale.x || 1, currentThickness);
    // Insert at index 0 so the halo renders behind all branch graphics
    viewport.addChildAt(g, 0);
    haloGfx = g;

    const capturedG = g;
    unregHaloRestroke = registerRestroke(scale => {
      if (!capturedG.destroyed) applyHaloShape(capturedG, scale, currentThickness);
    });
  };

  if (chronicleId) {
    initHalo();

    unregHaloManager = registerHalo(chronicleId, {
      show: () => {
        haloVisible = true;
        if (haloGfx && !haloGfx.destroyed) {
          haloGfx.visible = true;
          applyHaloShape(haloGfx, viewport.scale.x || 1, currentThickness);
        }
      },
      hide: () => {
        haloVisible = false;
        if (haloGfx && !haloGfx.destroyed) haloGfx.visible = false;
      },
    });
  }

  // ── Branch graphics ─────────────────────────────────────────────────────────
  const isChainHead = !chronicle.prev || !chronicle.prev.$;
  const isChainTail = !chronicle.next || !chronicle.next.$;
  const branchLabel = isChainHead
    ? (chronicleData?.title ?? undefined)
    : undefined;
  const isLabelAbove = levelIndex >= 0;

  const { graphics: gfx, restyle: baseRestyle } = drawBranch(viewport, {
    start: geom.start,
    end: geom.end,
    shift: geom.shift,
    color,
    thickness,
    drawStartDot: isChainHead,
    drawEndDot: isChainTail,
  });

  // Wrap restyle so the halo stays in sync with every chain animation frame.
  const restyle = (c: number, thk: number) => {
    baseRestyle(c, thk);
    currentThickness = thk;
    if (haloGfx && !haloGfx.destroyed) {
      applyHaloShape(haloGfx, viewport.scale.x || 1, thk);
    }
  };

  // ── Label store ─────────────────────────────────────────────────────────────
  const labelEntities: BranchLabelEntity[] = linkedEntities.map(entity => {
    const rec = entity as Record<string, unknown>;
    const str = (...keys: string[]) => {
      for (const k of keys) {
        const v = rec[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return undefined;
    };
    return {
      id: String(rec.id ?? Math.random()),
      name: str("name", "companyName", "company_name") ?? "?",
      domain: str("domain"),
      avatar: str("avatar", "logo", "logoUrl", "logo_url"),
    };
  });

  const syncLabel = (g: { start: number; end: number; shift: number }) => {
    if (!branchLabel) return;
    setLabel(registryKey, {
      id: registryKey,
      chronicleId,
      text: branchLabel,
      worldStartX: g.start,
      worldEndX: g.end,
      worldY: g.shift,
      isAbove: isLabelAbove,
      entities: labelEntities,
    });
  };
  syncLabel(geom);

  // ── Interaction ─────────────────────────────────────────────────────────────
  const onClickFunction = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    if (onPopup) {
      const isAbove = levelIndex > 0;
      const yOffset = isAbove ? -BRANCH.POPUP_Y_OFFSET : BRANCH.POPUP_Y_OFFSET;
      onPopup({
        chronicleData,
        linkedEntities,
        chronicleId: chronicle.$?.id ? String(chronicle.$.id) : undefined,
        worldX: (geom.start + geom.end) / 2,
        worldY: geom.shift + yOffset,
        isAbove,
      });
    }
  };

  gfx.interactive = true;
  gfx.cursor = "pointer";
  gfx.onclick = e => onClickFunction(e);

  gfx.on("pointerover", () => hoverChain(chainId));
  gfx.on("pointerout", () => unhoverChain(chainId));

  // ── Chain membership ────────────────────────────────────────────────────────
  const getBaseStyle = () => getBranchBaseStyle(chronicleId);
  const getHoverStyle = () => getBranchHoverStyle(chronicleId);
  const unregisterChain = registerChainMember(
    chainId,
    `branch_${registryKey}`,
    { restyle, getBaseStyle, getHoverStyle },
  );

  const entry = {
    gfx,
    restyle,
    chronicle,
    levelIndex,
    context,
    chainId,
    unsubscribeBranch: undefined as any,
    unsubscribeGlobal: undefined as any,
    unregisterChain,
  };
  branchRegistry.set(registryKey, entry);

  // ── Redraw (style / global config change) ───────────────────────────────────
  const redraw = () => {
    const g = branchRegistry.get(registryKey);
    if (!g) return;
    const { viewport: vp } = g.context;
    const newGeom = computeGeometry();
    const redrawId = g.chronicle.$?.id ? String(g.chronicle.$.id) : undefined;
    const { color, thickness } = getBranchBaseStyle(redrawId);

    // Destroy old branch gfx
    try {
      if (g.gfx.parent) g.gfx.parent.removeChild(g.gfx);
      g.gfx.destroy({ children: true, texture: false });
    } catch {}

    const { graphics: newGfx, restyle: newBaseRestyle } = drawBranch(vp, {
      start: newGeom.start,
      end: newGeom.end,
      shift: newGeom.shift,
      color,
      thickness,
      drawStartDot: isChainHead,
      drawEndDot: isChainTail,
    });

    const newRestyle = (c: number, thk: number) => {
      newBaseRestyle(c, thk);
      currentThickness = thk;
      if (haloGfx && !haloGfx.destroyed) {
        applyHaloShape(haloGfx, viewport.scale.x || 1, thk);
      }
    };

    // Recreate halo with updated geometry and reset thickness to base style
    geomRef.start = newGeom.start;
    geomRef.end = newGeom.end;
    geomRef.shift = newGeom.shift;
    currentThickness = thickness;
    initHalo();

    syncLabel(newGeom);

    newGfx.interactive = true;
    newGfx.cursor = "pointer";
    newGfx.onclick = e => onClickFunction(e);
    newGfx.on("pointerover", () => hoverChain(chainId));
    newGfx.on("pointerout", () => unhoverChain(chainId));

    if (g.unregisterChain) g.unregisterChain();
    g.unregisterChain = registerChainMember(chainId, `branch_${registryKey}`, {
      restyle: newRestyle,
      getBaseStyle,
      getHoverStyle,
    });

    g.gfx = newGfx;
    g.restyle = newRestyle;
    branchRegistry.set(registryKey, g);

    if (isChainHovered(chainId)) hoverChain(chainId);
  };

  const unsubBranch = subscribeBranch(id, redraw);
  entry.unsubscribeBranch = unsubBranch;
  const unsubGlobal = subscribeGlobal(redraw);
  entry.unsubscribeGlobal = unsubGlobal;

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  return () => {
    const e = branchRegistry.get(registryKey);
    if (!e) return;
    e.unsubscribeBranch?.();
    e.unsubscribeGlobal?.();
    e.unregisterChain?.();
    removeLabel(registryKey);
    if (unregHaloRestroke) unregHaloRestroke();
    if (unregHaloManager) unregHaloManager();
    if (haloGfx && !haloGfx.destroyed) {
      try {
        if (haloGfx.parent) haloGfx.parent.removeChild(haloGfx);
        haloGfx.destroy();
      } catch {}
    }
    try {
      if (e.gfx.parent) e.gfx.parent.removeChild(e.gfx);
      e.gfx.destroy({ children: true, texture: false });
    } catch {}
    branchRegistry.delete(registryKey);
  };
};
