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
} from "@/shared/drawing/dynamic/styleApi";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { $Schemas } from "@/shared/supabase/schemas";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles";
import { ButterflyCell } from "@/shared/structures/Butterfly";

// --- Typ-Aliase für bessere Lesbarkeit ---
type ChronicleCell = ButterflyCell<{
  id: string;
  knots: { start: number; end: number };
}>;

function Page() {
  /** ANCHOR: References */
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);

  /** ANCHOR: Fetched Data */
  const { data: ownChronicles } = useOwnChronicles();

  /** ANCHOR: Engines */
  const engine = useEngine();

  // Effect 1: Engine initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (ownChronicles && ownChronicles.length > 0) {
      console.warn("Engine activated");

      engine.init($Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles));
    }
  }, [ownChronicles]);

  // Effect 2: Pixi Application und Viewport initialisieren (läuft nur einmal)
  useEffect(() => {
    if (!pixiContainer.current || appRef.current) {
      return;
    }

    const app = new Application();
    appRef.current = app;

    const initializePixi = async () => {
      const container = pixiContainer.current!;
      await app.init({
        resizeTo: container,
        backgroundColor: 0xffffff,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      container.appendChild(app.canvas);

      const viewport = new Viewport({
        screenWidth: container.clientWidth,
        screenHeight: container.clientHeight,
        worldWidth: 1000, // Weltgröße (kann angepasst werden)
        worldHeight: 1000,
        events: app.renderer.events,
      });
      viewportRef.current = viewport;

      app.stage.addChild(viewport);
      viewport.drag().pinch().wheel().decelerate();
      viewport.fit().moveCenter(500, 500); // Zentriert die Welt
    };

    initializePixi();

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

    viewport.removeChildren(); // Vorherige Zeichnungen löschen

    // --- Normalisierungsparameter berechnen ---
    const aknot = 0;
    const distance = 1; // Standard-Distanz (vermeidet Division durch Null)

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

    console.log("Engine:", engine);

    const level0 = engine.getLevel(0);
    if (level0) {
      console.log("Level 0 found with", level0.length, "chronicles.");
      allChroniclesByLevel.set(0, level0.toArray()); // <-- KORREKTUR: In Array umwandeln
      allChronicles.push(...level0.toArray());
    }
    console.log("Level 0 Chronicles:", level0);

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

    console.log("all chronicles", allChronicles);
    allChronicles.forEach(chronicle => {
      if (chronicle) {
        drawChronicleBranch(drawingContext, chronicle, chronicle.y);
      }
    });

    allChronicles.forEach(startNodeWrapper => {
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

      console.log(
        `Drawing chain for ID ${startCell.$.id} with ${chain.length} segments.`,
      );

      // 3. Die Kette durchgehen und Segmente verbinden
      for (let i = 0; i < chain.length - 1; i++) {
        const sourceCell = chain[i];
        const targetCell = chain[i + 1];
        drawGenericConnection(drawingContext, sourceCell, targetCell);
      }
    });
  }, [engine.loaded, engine]);

  useEffect(() => {
    // Beispiel: global anpassen
    setGlobalConfig({
      branchColor: Math.floor(Math.random() * 0xffffff),
      layerDistance: 30,
    });
    setBranchStyle("109", { color: 0x00ff00 });
  }, []);

  return <div className="w-full h-screen" ref={pixiContainer}></div>;
}

export default Page;
