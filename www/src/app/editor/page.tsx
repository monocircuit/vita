"use client";

import React, { useEffect, useRef, useState } from "react";
import { Application, Graphics } from "pixi.js";
import useEngine from "@/utils/processing/engines/dynamic/useEngine";
import { drawBranch } from "@/utils/drawing/dynamic/drawBranch";
import { Viewport } from "pixi-viewport";
import { ButterflyCell } from "@/utils/structures/Butterfly";
import { useReadOwnChronicles } from "@/utils/supabase/api/tables/chronicles";
import filterChronicles from "@/utils/processing/data/chronicles/filterChronicles";
import { drawConnection } from "@/utils/drawing/dynamic/drawConnection";

// --- Konfiguration ---
const CONNECTION_COLOR = 0x000000;
const CONNECTION_THICKNESS = 2;
const BRANCH_COLOR = 0x000000;
const BRANCH_THICKNESS = 2;
const LAYER_DISTANCE = 30; // Abstand zwischen Layern in Pixeln

// --- Typ-Aliase für bessere Lesbarkeit ---
type ChronicleCell = ButterflyCell<{
  id: string;
  knots: { start: number; end: number };
}>;

type DrawingContext = {
  viewport: Viewport;
  aknot: number;
  distance: number;
  screenWidth: number;
  centerY: number;
  isRenderedChronicles: Set<string>;
};

// --- Hilfsfunktionen für das Zeichnen (ausgelagert) ---

/**
 * Zeichnet rekursiv alle vorherigen (prev) Chronicles und deren Verbindungen.
 */
const drawPreviousChronicles = (
  context: DrawingContext,
  nextChronicle: ChronicleCell,
  chronicle: ChronicleCell,
  prevLevelIndex: number
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;

  const nknots = normalize(nextChronicle.$.knots, aknot, distance);
  const nknotsPrev = normalize(chronicle.$.knots, aknot, distance);

  const StartX = nknotsPrev[0] * screenWidth;
  const EndX = nknotsPrev[1] * screenWidth;

  const nextStartX = nknots[0] * screenWidth;
  const nextEndX = nknots[1] * screenWidth;

  const nextConnStartX = connectionEndpointX(nextStartX, nextEndX);
  const ConnEndX = connectionEndpointX(EndX, StartX);

  // Verbindung zeichnen
  drawConnection(viewport, {
    startPoint: {
      x: nextConnStartX,
      y: centerY - nextChronicle.y * LAYER_DISTANCE,
    },
    endPoint: { x: ConnEndX, y: centerY - chronicle.y * LAYER_DISTANCE },
    color: CONNECTION_COLOR,
    thickness: CONNECTION_THICKNESS,
  });

  // Ast (Branch) zeichnen
  drawBranch(viewport, {
    start: nknotsPrev[0] * screenWidth,
    end: nknotsPrev[1] * screenWidth,
    shift: centerY - prevLevelIndex * LAYER_DISTANCE,
    title: "t", // TODO: Dynamischer Titel?
    color: BRANCH_COLOR,
    thickness: BRANCH_THICKNESS,
  });

  // Rekursion, falls weitere 'prev' vorhanden sind
  if (chronicle.prev) {
    drawPreviousChronicles(context, chronicle, chronicle.prev, chronicle.prev.y);
  }
};

/**
 * Zeichnet rekursiv alle nächsten (next) Chronicles und deren Verbindungen.
 */
const drawNextChronicles = (
  context: DrawingContext,
  prevChronicle: ChronicleCell,
  chronicle: ChronicleCell
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;

  const nknots = normalize(prevChronicle.$.knots, aknot, distance);
  const nknotsNext = normalize(chronicle.$.knots, aknot, distance);

  const nextStartX = nknots[0] * screenWidth;
  const nextEndX = nknotsNext[1] * screenWidth;
  const nextConnEndX = connectionEndpointX(nextEndX, nextStartX);

  // Verbindung zeichnen
  drawConnection(viewport, {
    startPoint: {
      x: nknots[0] * screenWidth,
      y: centerY - prevChronicle.y * LAYER_DISTANCE,
    },
    endPoint: {
      x: nextConnEndX,
      y: centerY - chronicle.y * LAYER_DISTANCE,
    },
    color: CONNECTION_COLOR,
    thickness: CONNECTION_THICKNESS,
  });

  // Ast (Branch) zeichnen
  drawBranch(viewport, {
    start: nknotsNext[0] * screenWidth,
    end: nknotsNext[1] * screenWidth,
    shift: centerY - chronicle.y * LAYER_DISTANCE,
    title: "t", // TODO: Dynamischer Titel?
    color: BRANCH_COLOR,
    thickness: BRANCH_THICKNESS,
  });

  // Rekursion, falls weitere 'next' vorhanden sind
  if (chronicle.next) {
    drawNextChronicles(context, chronicle, chronicle.next);
  } else {
    // Markiert das Ende der Kette (wie im Originalcode)
    chronicle.flag = () => true;
  }
};

/**
 * Hauptfunktion zum Zeichnen einer einzelnen Chronicle und Anstoßen der
 * rekursiven Zeichnung von 'prev' und 'next'.
 */
const drawChronicle = (
  context: DrawingContext,
  chronicle: ChronicleCell,
  levelIndex: number
) => {
  const {
    viewport,
    aknot,
    distance,
    screenWidth,
    centerY,
    isRenderedChronicles,
  } = context;

  // Überspringen, falls bereits gerendert
  if (isRenderedChronicles.has(chronicle.$.id.toString())) return;

  // Nur zeichnen, wenn nicht geflaggt
  if (!chronicle.isFlagged) {
    const nknots = normalize(chronicle.$.knots, aknot, distance);

    // Den Haupt-Ast (Branch) für diese Chronicle zeichnen
    drawBranch(viewport, {
      start: nknots[0] * screenWidth,
      end: nknots[1] * screenWidth,
      shift: centerY - levelIndex * LAYER_DISTANCE,
      title: "t", // TODO: Dynamischer Titel?
      color: BRANCH_COLOR,
      thickness: BRANCH_THICKNESS,
    });

    // Rekursives Zeichnen der 'prev'-Kette starten
    if (chronicle.prev && !chronicle.isFlagged) {
      drawPreviousChronicles(context, chronicle, chronicle.prev, chronicle.prev.y);
    }

    // Rekursives Zeichnen der 'next'-Kette starten
    if (chronicle.next && !chronicle.isFlagged) {
      drawNextChronicles(context, chronicle, chronicle.next);
    } else {
      // Markiert das Ende der Kette (wie im Originalcode)
      chronicle.flag = () => true;
    }
  }

  // Nach dem Zeichnen zur Rendered-Liste hinzufügen
  chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
};

// --- React Komponente ---

function Page() {
  /** ANCHOR: References */
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);

  /** ANCHOR: Fetched Data */
  const { chronicles: ownChronicles, isLoading } = useReadOwnChronicles();

  /** ANCHOR: Engines */
  const { init, engine } = useEngine();
  const [isEngineReady, setEngineReady] = useState(false);

  // Effect 1: Engine initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (!isLoading && ownChronicles.length > 0 && !isEngineReady) {
      console.warn("Engine activated");
      const { linear } = filterChronicles(ownChronicles);
      console.log("Linear Chronicles:", linear);
      init(linear);
      setEngineReady(true);
    }
  }, [ownChronicles, isLoading, init, isEngineReady]);

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
  }, []); // Leeres Array stellt sicher, dass dies nur einmal ausgeführt wird

  // Effect 3: Inhalt zeichnen, wenn die Engine bereit ist
  useEffect(() => {
    const viewport = viewportRef.current;
    const container = pixiContainer.current;

    // Abbrechen, wenn Engine oder Viewport nicht bereit sind
    if (!isEngineReady || !viewport || !container) {
      return;
    }

    viewport.removeChildren(); // Vorherige Zeichnungen löschen

    // --- Normalisierungsparameter berechnen ---
    let aknot = 0;
    let distance = 1; // Standard-Distanz (vermeidet Division durch Null)

    const level0 = engine.current.getLevel(0);
    if (level0 && level0.length > 0) {
      aknot = engine.current.get(0, 0)?.$.knots.start ?? 0;
      const lastKnot =
        engine.current.getLastCell(0)?.$.knots.end ?? aknot;
      distance = lastKnot - aknot;
      if (distance === 0) distance = 1;
    }

    // --- Dimensionen und Kontext für das Zeichnen vorbereiten ---
    const positiveLayerHeight = engine.current.yDimensions.positive;
    const negativeLayerHeight = engine.current.yDimensions.negative;

    const screenWidth = container.clientWidth;
    const screenHeight = container.clientHeight;
    const centerY = screenHeight / 2;

    const drawingContext: DrawingContext = {
      viewport,
      aknot,
      distance,
      screenWidth,
      centerY,
      isRenderedChronicles: new Set<string>(),
    };

    // --- Render-Schleifen ---

    // Level 0 rendern
    // HINWEIS: Die spezielle Logik für 'start'/'end' im Originalcode
    // (Zeilen 208-218) wurde entfernt, da sie nicht verwendet wurde.
    // 'drawChronicle' berechnet die Positionen selbst.
    level0?.forEach((chronicle) => {
      console.log("chronicle:", chronicle.$.id);
      drawChronicle(drawingContext, chronicle, chronicle.y);
    });

    // Positive Level rendern (1, 2, 3...)
    for (let i = 0; i < positiveLayerHeight; i++) {
      const levelIndex = i + 1;
      const level = engine.current.getLevel(levelIndex);
      level?.forEach((chronicle) => {
        drawChronicle(drawingContext, chronicle, chronicle.y);
      });
    }

    // Negative Level rendern (-1, -2, -3...)
    for (let i = 0; i < negativeLayerHeight; i++) {
      const levelIndex = i + 1; // Index ist positiv
      const level = engine.current.getLevel(-levelIndex); // Zugriff mit negativem Index
      level?.forEach((chronicle) => {
        drawChronicle(drawingContext, chronicle, chronicle.y);
      });
    }
  }, [isEngineReady, engine]); // Abhängigkeit von 'engine' hinzugefügt, falls sich die Engine-Instanz ändert

  return <div className="w-full h-screen" ref={pixiContainer}></div>;
}

// --- Unveränderte Hilfsfunktionen ---

const normalize = (
  knots: { start: number; end: number },
  aKnot: number,
  distance: number
) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots.start - aKnot) / distance;
  normalizedKnots[1] = (knots.end - aKnot) / distance;
  return normalizedKnots;
};

/**
* Berechnet den X-Endpunkt für eine Verbindungslinie an einem Ast.
* (Originalfunktion unverändert)
*/
const connectionEndpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(length * 0.25, 75); // 25% oder maximal 75px
  return startX < endX ? startX + offset : startX - offset;
};

export default Page;