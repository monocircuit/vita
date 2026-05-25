"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  setGlobalConfig,
  setBranchStyle,
  GlobalStyleConfig,
  BranchStyle,
} from "@/shared/drawing/dynamic/styleApi";
import { MOBILE_BREAKPOINT } from "@/shared/drawing/dynamic/config";
import Engine from "@/shared/processing/engines/dynamic/Engine";
import { FreeNoteData } from "@/shared/drawing/dynamic/drawDraggableNote";
import { useDeleteChronicle } from "@/shared/data/local";
import type { ChronicleView } from "../../../../electron/ipc/contracts";
import type { Entity } from "../../../../electron/db/schema";
import { ActivePopup } from "./helpers";
import { usePixiApp } from "./hooks/usePixiApp";
import { useCanvasTheme } from "./hooks/useCanvasTheme";
import { useTimeline } from "./hooks/useTimeline";
import { useBranchRenderer } from "./hooks/useBranchRenderer";
import ChronicleOverlay from "./components/ChronicleOverlay";
import BranchLabelOverlay from "./components/BranchLabelOverlay";
import TimelineLabelsOverlay from "./components/TimelineLabelsOverlay";
import TimelineHoverLabel from "./components/TimelineHoverLabel";
import { RendererDebugPanel } from "./components/RendererDebugPanel";
import { showHalo, hideActiveHalo } from "./branchHaloManager";
import { useSavingIndicator } from "@/app/editor/hooks/useSavingIndicator";

interface RendererProps {
  globalConfig?: GlobalStyleConfig;
  branchStyles?: Map<string, BranchStyle>;
  engine?: Engine;
  chronicles?: ChronicleView[] | undefined;
  entitiesByChronicleId?: Map<string, Entity[]>;
  onCanvasDoubleTap?: (x: number, y: number) => void;
  onNoteMove?: (id: string, x: number, y: number) => void;
  notes?: FreeNoteData[];
  isDataLoading?: boolean;
}

function Renderer({
  chronicles,
  entitiesByChronicleId,
  branchStyles,
  globalConfig,
  engine,
  notes = [],
  onNoteMove,
  isDataLoading = false,
}: RendererProps) {
  const pixiContainer = useRef<HTMLDivElement>(null);
  const fitViewFnRef = useRef<(() => void) | null>(null);
  const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);
  const deleteChronicle = useDeleteChronicle();

  const handlePopup = useCallback((popup: ActivePopup) => {
    setActivePopup(prev => {
      // Toggle off if clicking the same branch
      if (
        prev &&
        prev.chronicleId === popup.chronicleId &&
        prev.worldX === popup.worldX
      ) {
        return null;
      }
      return popup;
    });
  }, []);

  const dismissPopup = useCallback(() => setActivePopup(null), []);

  // Show / hide the PIXI selection halo when the active popup changes
  useEffect(() => {
    if (activePopup?.chronicleId) {
      showHalo(activePopup.chronicleId);
    } else {
      hideActiveHalo();
    }
  }, [activePopup?.chronicleId]);

  useEffect(() => {
    if (!activePopup?.chronicleId) return;

    const nextChronicle = chronicles?.find(
      c => String(c.id) === activePopup.chronicleId,
    );
    const nextLinkedEntities =
      entitiesByChronicleId?.get(activePopup.chronicleId) ?? [];

    setActivePopup(prev => {
      if (!prev || prev.chronicleId !== activePopup.chronicleId) {
        return prev;
      }

      return {
        ...prev,
        chronicleData: nextChronicle,
        linkedEntities: nextLinkedEntities,
      };
    });
  }, [activePopup?.chronicleId, chronicles, entitiesByChronicleId]);

  const handleDeleteChronicle = useCallback(
    async (chronicleId: number) => {
      setActivePopup(null);
      await deleteChronicle.mutateAsync(chronicleId);
    },
    [deleteChronicle],
  );

  const { appRef, viewportRef, uiContainerRef, isReady } = usePixiApp(
    pixiContainer,
    !!engine,
  );

  useCanvasTheme(appRef, isReady);

  useTimeline(
    appRef,
    viewportRef,
    uiContainerRef,
    pixiContainer,
    chronicles,
    isReady,
    fitViewFnRef,
  );

  useBranchRenderer(
    viewportRef,
    pixiContainer,
    engine,
    chronicles,
    entitiesByChronicleId ?? new Map(),
    notes,
    onNoteMove,
    isReady,
    fitViewFnRef,
    handlePopup,
  );

  // Dismiss popup when clicking empty canvas
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onViewportClick = () => setActivePopup(null);
    viewport.on("clicked", onViewportClick);
    return () => {
      viewport.off("clicked", onViewportClick);
    };
  }, [isReady, viewportRef]);

  // Apply styles — scale branch thickness for narrow screens, re-apply on rotation
  useEffect(() => {
    const applyStyles = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const responsiveThickness = mobile ? 3 : 6;
      setGlobalConfig({
        branchThickness: responsiveThickness,
        connectionThickness: responsiveThickness,
        ...(mobile ? { layerDistance: 40 } : {}),
        ...globalConfig,
      });
      branchStyles?.forEach((style, id) => setBranchStyle(id, style));
    };

    applyStyles();

    const onResize = () => requestAnimationFrame(applyStyles);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [globalConfig, branchStyles]);

  const savingState = useSavingIndicator();
  const hasChronicles = (chronicles?.length ?? 0) > 0;
  const shouldShowLoadingIndicator =
    isDataLoading || !isReady || (hasChronicles && !engine?.loaded);

  if (!engine) return <div>Engine not provided</div>;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full" ref={pixiContainer}></div>
      <BranchLabelOverlay
        viewportRef={viewportRef}
        hiddenChronicleId={activePopup?.chronicleId}
      />
      <TimelineLabelsOverlay viewportRef={viewportRef} />
      <TimelineHoverLabel viewportRef={viewportRef} containerRef={pixiContainer} />
      <ChronicleOverlay
        popup={activePopup}
        viewportRef={viewportRef}
        onDismiss={dismissPopup}
        onDeleteChronicle={handleDeleteChronicle}
      />

      {shouldShowLoadingIndicator ? (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-bg/65">
          <div className="flex items-center gap-2 px-3 py-2 border-(length:--stroke) border-solid border-border bg-surface-raised text-fg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-[10px] uppercase tracking-wide text-fg/80">
              Loading renderer
            </span>
          </div>
        </div>
      ) : null}

      {/* Saving indicator — top right */}
      <div
        className={`absolute top-3 right-4 z-10 flex items-center gap-1.5 px-2 py-1 border-(length:--stroke) border-solid border-border bg-bg text-[10px] uppercase tracking-wide transition-opacity duration-300 ${savingState === "idle" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {savingState === "saving" ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-muted">Saving</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            <span className="text-muted">Saved</span>
          </>
        )}
      </div>

      <button
        className="absolute bottom-4 right-4 z-10 bg-surface-raised border border-border rounded px-3 py-1 text-sm text-fg shadow hover:bg-surface"
        onClick={() => fitViewFnRef.current?.()}
      >
        Fit
      </button>

      <RendererDebugPanel engine={engine} />
    </div>
  );
}

export default Renderer;
