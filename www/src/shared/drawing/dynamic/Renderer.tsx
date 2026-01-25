"use client";

import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
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

interface RendererProps {
  /**
   * Props for the `Renderer` component.
   *
   * - `globalConfig` — Optional global drawing configuration passed into the drawing style API (`setGlobalConfig`).
   * - `branchStyles` — Map of branch id -> `BranchStyle` applied via `setBranchStyle`.
   * - `engine` — Engine instance providing layout data. Expected shape (used by `Renderer`):
   *    - `loaded: boolean`
   *    - `getLevel(level: number)` => collection with `.length` and `.toArray()` returning `ButterflyCell[]`
   *    - `get(x: number, y: number)` => `ButterflyCell | undefined`
   *    - `getLastCell(y: number)` => `ButterflyCell | undefined`
   *    - `yDimensions: { positive: number, negative: number }`
   */
  globalConfig?: GlobalStyleConfig;
  branchStyles?: Map<string, BranchStyle>;
  engine?: Engine;
  chronicles?: NormalizedRowFor<"chronicles">[] | undefined;

  onCanvasDoubleTap?: (x: number, y: number) => void;
  onNoteMove?: (id: string, x: number, y: number) => void;
  notes?: FreeNoteData[];
}

/**
 * Renderer initializes a Pixi `Application` + `Viewport` and draws chronicles
 * using the provided `engine` data. It waits for `engine.loaded` before
 * rendering. Pass `branchStyles` keys that match chronicle/branch identifiers
 * used by your engine data so `setBranchStyle` applies correctly.
 *
 * Example usage:
 * <Renderer engine={engine} globalConfig={...} branchStyles={new Map([["id", style]])} />
 */
function Renderer({
  chronicles,
  branchStyles,
  globalConfig,
  engine,
  notes = [],
  onNoteMove,
  onCanvasDoubleTap,
}: RendererProps) {
  /** ANCHOR: References */
  const pixiContainer = useRef<HTMLDivElement>(null);

  //App Ref for access in effects
  const appRef = useRef<Application | null>(null);

  // Viewport Ref for access in effects
  const viewportRef = useRef<Viewport | null>(null);

  //Coord Ref for getting mouse position
  const coordsRef = useRef<HTMLDivElement>(null);

  if (!!engine) {
    //Initialisierung des Pixi-Anwendungs und Viewports
    useEffect(() => {
      if (!pixiContainer.current || appRef.current) {
        return;
      }

      const app = new Application();
      appRef.current = app;

      const init = async () => {
        const container = pixiContainer.current!;
        await app.init({
          resizeTo: container,
          backgroundColor: 0xffffff,
          resolution: window.devicePixelRatio || 1,
        });
        container.appendChild(app.canvas);

        const viewport = new Viewport({
          screenWidth: container.clientWidth,
          screenHeight: container.clientHeight,
          worldWidth: 2000,
          worldHeight: 2000,
          events: app.renderer.events,
        });
        viewportRef.current = viewport;
        app.stage.addChild(viewport);

        viewport.drag().pinch().wheel().decelerate();

        // Funktionen für UserInteractions

        // --- NEU: Event Listener für Doppelklick auf Hintergrund ---
        //  viewport.on("clicked", (e) => {
        //    if (onCanvasDoubleTap) {
        //      const worldPos = viewport.toWorld(e.screen);
        //      onCanvasDoubleTap(worldPos.x, worldPos.y);
        //    }
        //  });
      };
      init();

      return () => {
        app.destroy(true, true);
        appRef.current = null;
        viewportRef.current = null;
      };
    }, []);

    // Effect 3: Inhalt zeichnen, wenn die Engine bereit ist
    useEffect(() => {
      const viewport = viewportRef.current;
      const container = pixiContainer.current;

      // Abbrechen, wenn Engine oder Viewport nicht bereit sind
      if (!engine.loaded || !viewport || !container) {
        return;
      }

      viewport.removeChildren();

      // --- Normalisierungsparameter berechnen ---
      const aknot = 0;
      const distance = 1;

      const screenWidth = container.clientWidth;
      const screenHeight = container.clientHeight;
      const centerY = screenHeight / 2;

      const drawingContext: DrawingContext = {
        viewport,
        aknot,
        distance,
        screenWidth,
        centerY,
      };

      const allChroniclesByLevel = new Map<
        number,
        ButterflyCell<{
          knots: {
            start: number;
            end: number;
          };
          id: number;
        }>[]
      >();
      const allChronicles: ButterflyCell<{
        knots: {
          start: number;
          end: number;
        };
        id: number;
      }>[] = [];

      const level0 = engine.getLevel(0);
      if (level0) {
        console.log("Level 0 found with", level0.length, "chronicles.");
        allChroniclesByLevel.set(0, level0.toArray()); // <-- KORREKTUR: In Array umwandeln
        allChronicles.push(...level0.toArray());
      }
      // Positive Level
      const positiveLayerHeight = engine.yDimensions.positive;
      for (let i = 0; i < positiveLayerHeight; i++) {
        const level = engine.getLevel(i + 1);
        if (level) {
          allChroniclesByLevel.set(i + 1, level.toArray()); // <-- KORREKTUR: In Array umwandeln
          allChronicles.push(...level.toArray());
        }
      }
      // Negative Level
      const negativeLayerHeight = engine.yDimensions.negative;
      for (let i = 0; i < negativeLayerHeight; i++) {
        const level = engine.getLevel(-(i + 1));
        if (level) {
          allChroniclesByLevel.set(-(i + 1), level.toArray()); // <-- KORREKTUR: In Array umwandeln
          allChronicles.push(...level.toArray());
        }
      }

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

      //Zeichnen der Äste:
      allChronicles.forEach((chronicle) => {
        if (chronicle) {
          const a = chronicles?.find((e) => e.id === chronicle.$?.id);

          drawChronicleBranch(drawingContext, chronicle, chronicle.y, a);
        }
      });

      allChronicles.forEach((startNodeWrapper) => {
        const startCell = startNodeWrapper; // Das eigentliche ButterflyCell Objekt

        // 1. Abbruchbedingung: Wir suchen nur Startpunkte.
        // Wenn eine Zelle einen Vorgänger hat, ist sie ein Mittelstück
        // und wird später von ihrem Vorgänger aus behandelt.
        if (!startCell || startCell.prev) return;

        // 2. Die Kette (Chain) aufbauen
        const chain: ButterflyCell<any>[] = [startCell];
        let currentPointer = startCell.next;

        // "Follow the breadcrumbs": Solange es ein next gibt, fügen wir es zur Kette hinzu
        while (currentPointer) {
          chain.push(currentPointer);
          currentPointer = currentPointer.next;
        }

        // Wenn die Kette nur 1 Element hat, gibt es nichts zu verbinden
        if (chain.length < 2) return;

        // 3. Die Kette durchgehen und Segmente verbinden
        for (let i = 0; i < chain.length - 1; i++) {
          const sourceCell = chain[i];
          const targetCell = chain[i + 1];
          drawGenericConnection(drawingContext, sourceCell, targetCell);
        }
      });

      // move Viewport to center;

      notes.forEach((note) => {
        drawDraggableNote(viewport, note, (id, x, y) => {
          if (onNoteMove) {
            onNoteMove(id, x, y);
          }
        });
      });
    }, [engine.loaded, engine, notes]);

    useEffect(() => {
      // Beispiel: global anpassen
      setGlobalConfig(globalConfig || {});
      branchStyles?.forEach((style, id) => {
        setBranchStyle(id, style);
      });
    }, []);

    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full "
          ref={pixiContainer}
        ></div>

        <div
          ref={coordsRef}
          className="fixed z-50 bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-400 px-3 py-1  shadow-lg text-xs font-mono text-gray-800 pointer-events-none select-none"
        >
          Hallo Welt
        </div>
      </div>
    );
  } else {
    return <div>Engine not provided</div>;
  }
}

export default Renderer;
