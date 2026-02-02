"use client";

import { useEffect, useRef, useState } from "react";
import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { drawChronicleBranch } from "@/shared/drawing/dynamic/drawChronicleBranch";
import { drawGenericConnection } from "@/shared/drawing/dynamic/drawGenericConnection";
import { DrawingContext } from "@/shared/drawing/dynamic/helpers";
import {
  setGlobalConfig,
  setBranchStyle,
  GlobalStyleConfig,
  BranchStyle,
} from "@/shared/drawing/dynamic/styleApi";
import { ButterflyCell } from "@/shared/structures/Butterfly";
import Engine from "@/shared/processing/engines/dynamic/Engine";
import {
  drawDraggableNote,
  FreeNoteData,
} from "@/shared/drawing/dynamic/drawDraggableNote";
import { NormalizedRowFor } from "@/shared/tanstack/reader/types";
import { drawTimeLine } from "./components/drawTimeLine";

interface RendererProps {
  globalConfig?: GlobalStyleConfig;
  branchStyles?: Map<string, BranchStyle>;
  engine?: Engine;
  chronicles?: NormalizedRowFor<"chronicles">[] | undefined;
  onCanvasDoubleTap?: (x: number, y: number) => void;
  onNoteMove?: (id: string, x: number, y: number) => void;
  notes?: FreeNoteData[];
}

function Renderer({
  chronicles,
  branchStyles,
  globalConfig,
  engine,
  notes = [],
  onNoteMove,
  onCanvasDoubleTap,
}: RendererProps) {
  // 1. TOP LEVEL HOOKS
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const uiContainerRef = useRef<Container | null>(null);
  const coordsRef = useRef<HTMLDivElement>(null);

  // State: Ist Pixi bereit?
  const [isPixiReady, setIsPixiReady] = useState(false);

  // --- EFFECT 1: INITIALIZATION ---
  useEffect(() => {
    if (!engine || !pixiContainer.current) return;
    if (appRef.current) return;

    let isMounted = true;

    const app = new Application();
    appRef.current = app;

    const init = async () => {
      await app.init({
        resizeTo: pixiContainer.current!,
        backgroundColor: 0xffffff,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      if (!isMounted) {
        app.destroy();
        return;
      }

      if (pixiContainer.current) {
        pixiContainer.current.appendChild(app.canvas);
      }

      // Layer 0: Viewport
      const viewport = new Viewport({
        screenWidth: pixiContainer.current!.clientWidth,
        screenHeight: pixiContainer.current!.clientHeight,
        worldWidth: pixiContainer.current?.clientWidth || 1000, // Platzhalter, wird dynamisch angepasst
        worldHeight: 2000,
        events: app.renderer.events,
      });
      viewportRef.current = viewport;
      viewport.zIndex = 1;
      app.stage.addChild(viewport);

      viewport.drag({ direction: "x" }).pinch().wheel().decelerate().clampZoom({
        minWidth: 450,
        maxWidth: 2000,
      });

      // Layer 100: UI Container
      const uiContainer = new Container();
      uiContainer.zIndex = 100;
      app.stage.addChild(uiContainer);

      app.stage.sortableChildren = true;
      uiContainerRef.current = uiContainer;

      // Resize Handler
      const onResize = () => {
        if (pixiContainer.current) {
          app.renderer.resize(
            pixiContainer.current.clientWidth,
            pixiContainer.current.clientHeight,
          );
          viewport.resize(
            pixiContainer.current.clientWidth,
            pixiContainer.current.clientHeight,
          );
        }
      };
      window.addEventListener("resize", onResize);
      (app as any)._customResizeHandler = onResize;

      // Double Tap
      //viewport.on("clicked", (e) => {
      //  if (onCanvasDoubleTap) {
      //    const worldPos = viewport.toWorld(e.screen);
      //    onCanvasDoubleTap(worldPos.x, worldPos.y);
      //  }
      //});

      setIsPixiReady(true);
    };

    init();

    return () => {
      isMounted = false;
      const resizeHandler = (appRef.current as any)?._customResizeHandler;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);

      if (appRef.current) {
        appRef.current.destroy(true, true);
        appRef.current = null;
        viewportRef.current = null;
        uiContainerRef.current = null;
        setIsPixiReady(false);
      }
    };
  }, [engine]);

  // --- EFFECT 2: TIMELINE LOGIC (Mit Fixing & Clamping) ---
  useEffect(() => {
    if (
      !isPixiReady ||
      !uiContainerRef.current ||
      !viewportRef.current ||
      !pixiContainer.current
    )
      return;

    const uiContainer = uiContainerRef.current;
    const viewport = viewportRef.current;
    const app = appRef.current;

    if (!app || !chronicles || chronicles.length === 0) return;

    // --- A. CALCULATE DATA BOUNDS ---
    const startTimes = chronicles.map((c) => c.knots[0]);
    const endTimes = chronicles.map((c) => c.knots[c.knots.length - 1]);

    const minMs = Math.min(...startTimes);
    const maxMs = Math.max(...endTimes);
    const totalDurationMs = maxMs - minMs;

    if (totalDurationMs <= 0) return;

    // Konfiguration: Wie breit soll 1 Jahr in der Welt sein?
    // z.B. 50 Pixel pro Jahr (unabhängig vom Zoom)

    const totalYears = totalDurationMs / (1000 * 60 * 60 * 24 * 365.25);
    const pixelsPerYearConstant = viewport.screenWidth / totalYears;

    // Berechne die totale Breite der "Welt" basierend auf den Daten
    const targetWorldWidth = totalYears * pixelsPerYearConstant;

    const padding = 200;

    viewport.clamp({
      left: -padding,
      direction: "x", 
    });

    // Das Verhältnis: Pixel pro Millisekunde
    const pixelsPerMs = targetWorldWidth / totalDurationMs;

    const renderTimeline = () => {
      uiContainer.removeChildren();
      const screenWidth = app.screen.width;
      const screenHeight = app.screen.height;

      // Berechne sichtbaren Zeitbereich
      // viewport.left ist die World-X Koordinate am linken Bildschirmrand
      const visibleStartMs = minMs + viewport.left / pixelsPerMs;
      const visibleEndMs = minMs + viewport.right / pixelsPerMs;

      const minYear = new Date(visibleStartMs).getFullYear();
      const maxYear = new Date(visibleEndMs).getFullYear();
      const yearRange = maxYear - minYear;

      // Erlaubte Schritte definieren, damit keine krummen Zahlen kommen
      const allowedSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

      // Wähle den besten Schritt basierend auf der sichtbaren Range
      const targetCount = 10;
      const idealStep = yearRange / targetCount;

      // Finde den nächstgelegenen erlaubten Schritt
      let step = allowedSteps.find((s) => s >= idealStep) || 1000;

      // --- C. RUNDUNG ---
      const smoothStart = Math.floor(minYear / step) * step;
      const smoothEnd = Math.ceil(maxYear / step) * step;

      // Diese Funktion wandelt ein Jahr in die exakte X-Position auf dem Screen um
      const getScreenX = (year: number) => {
        // Zeitdifferenz in MS vom Start
        // Näherung über Date Objekt, um Schaltjahre grob zu berücksichtigen
        const dateOfTick = new Date(year, 0, 1).getTime();
        const msDiff = dateOfTick - minMs;

        // World X Position
        const worldX = msDiff * pixelsPerMs;

        // Screen X Position (World -> Screen Transformation)
        // screenX = (worldX - viewportLeft) * zoomScale
        return (worldX - viewport.left) * viewport.scale.x;
      };

      // Draw
      drawTimeLine(uiContainer, {
        y: screenHeight - 160,
        screenWidth: screenWidth, // Neue Prop für Clipping
        minYear: smoothStart,
        maxYear: smoothEnd,
        step: step,
        getScreenX: getScreenX, // Funktion übergeben
        style: {
          color: 0x333333,
          labelColor: 0x555555,
          width: 2,
          tickHeight: 10,
        },
      });
    };

    renderTimeline();

    // Listeners
    viewport.on("moved", renderTimeline);
    const handleResize = () => requestAnimationFrame(renderTimeline);
    window.addEventListener("resize", handleResize);

    return () => {
      viewport.off("moved", renderTimeline);
      window.removeEventListener("resize", handleResize);
      uiContainer.removeChildren();
    };
  }, [chronicles, isPixiReady]);

  // --- EFFECT 3: DRAW BRANCHES ---
  useEffect(() => {
    if (
      !engine ||
      !engine.loaded ||
      !isPixiReady ||
      !viewportRef.current ||
      !pixiContainer.current
    )
      return;

    const viewport = viewportRef.current;
    const container = pixiContainer.current;
    viewport.removeChildren();

    const drawingContext: DrawingContext = {
      viewport,
      aknot: 0,
      distance: 1,
      screenWidth: container.clientWidth,
      centerY: container.clientHeight / 2,
    };

    const allChroniclesByLevel = new Map<number, ButterflyCell<any>[]>();
    const allChronicles: ButterflyCell<any>[] = [];

    // --- COLLECT DATA ---
    const collectLevel = (lvl: number) => {
      const l = engine.getLevel(lvl);
      if (l) {
        allChroniclesByLevel.set(lvl, l.toArray());
        allChronicles.push(...l.toArray());
      }
    };
    collectLevel(0);
    for (let i = 0; i < engine.yDimensions.positive; i++) collectLevel(i + 1);
    for (let i = 0; i < engine.yDimensions.negative; i++)
      collectLevel(-(i + 1));

    // --- NORMALIZE CONTEXT ---
    const level0 = engine.getLevel(0);
    if (level0 && level0.length > 0) {
      const firstCell = engine.get(0, 0);
      const lastCell = engine.getLastCell(0);

      if (firstCell && firstCell.$ && lastCell && lastCell.$) {
        drawingContext.aknot = firstCell.$.knots.start;
        const lastKnot = lastCell.$.knots.end;
        drawingContext.distance = lastKnot - drawingContext.aknot;
        if (drawingContext.distance === 0) drawingContext.distance = 1;
      }
    }

    // --- DRAW ---
    allChronicles.forEach((chronicle) => {
      if (chronicle) {
        const a = chronicles?.find((e) => e.id === chronicle.$?.id);
        drawChronicleBranch(drawingContext, chronicle, chronicle.y, a);
      }
    });

    allChronicles.forEach((startCell) => {
      if (!startCell || startCell.prev) return;
      let curr = startCell;
      while (curr.next) {
        drawGenericConnection(drawingContext, curr, curr.next);
        curr = curr.next;
      }
    });

    notes.forEach((note) => {
      drawDraggableNote(viewport, note, (id, x, y) => {
        if (onNoteMove) onNoteMove(id, x, y);
      });
    });
  }, [engine, engine?.loaded, notes, chronicles, isPixiReady]);

  // --- EFFECT 4: STYLES ---
  useEffect(() => {
    setGlobalConfig(globalConfig || {});
    branchStyles?.forEach((style, id) => setBranchStyle(id, style));
  }, [globalConfig, branchStyles]);

  if (!engine) return <div>Engine not provided</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full" ref={pixiContainer}></div>
    </div>
  );
}

export default Renderer;
