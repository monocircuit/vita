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

// Maximale Pixel-Lücke, die noch als "direkte" Geschwister-Verbindung gilt
const MAX_SIBLING_PIXEL_GAP = 10;

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


/**
 * Zeichnet eine "Abzweigungs"-Verbindung (Fork) von der zentralen Achse (Layer 0)
 * zum Anfang eines Astes auf Layer Y.
 */
const drawForkFromCenterline = (
  context: DrawingContext,
  chronicle: ChronicleCell
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;

  // Normalisiere die Positionen des Ziel-Astes
  const nknots = normalize(chronicle.$.knots, aknot, distance);
  const branchStartX = nknots[0] * screenWidth;
  const branchEndX = nknots[1] * screenWidth;

  // Startpunkt: Auf Layer 0, an der X-Position des Ast-Anfangs
  const startX_onLayer0 = branchStartX;
  const startY_onLayer0 = centerY; // Y-Position von Layer 0

  // Endpunkt: Der Anfang des Astes auf Layer Y
  // Wir nutzen connectionEndpointX, um den Ankerpunkt am Ast zu finden
  const endX_onBranch = connectionEndpointX(branchStartX, branchEndX);
  const endY_onBranch = centerY - chronicle.y * LAYER_DISTANCE;

  // Simuliere einen Ankerpunkt auf Layer 0 für die Kurve
  const startAnchorX = connectionEndpointX(startX_onLayer0, startX_onLayer0 + 10); // +10 simuliert "vorwärts"

  drawConnection(viewport, {
    startPoint: { x: startAnchorX, y: startY_onLayer0 },
    endPoint: { x: endX_onBranch, y: endY_onBranch },
    color: 0xAAAAAA, // Leichtes Grau für Fork/Merge
    thickness: CONNECTION_THICKNESS - 1, // Etwas dünner
  });
};

/**
 * Zeichnet eine "Rückkehr"-Verbindung (Merge) vom Ende eines Astes 
 * auf Layer Y zurück zur zentralen Achse (Layer 0).
 */
const drawMergeToCenterline = (
  context: DrawingContext,
  chronicle: ChronicleCell
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;

  // Normalisiere die Positionen des Quell-Astes
  const nknots = normalize(chronicle.$.knots, aknot, distance);
  const branchStartX = nknots[0] * screenWidth;
  const branchEndX = nknots[1] * screenWidth;

  // Startpunkt: Das Ende des Astes auf Layer Y
  // Wir nutzen connectionEndpointX, um den Ankerpunkt am Ast zu finden
  const startX_onBranch = connectionEndpointX(branchEndX, branchStartX); // (Ende -> Start)
  const startY_onBranch = centerY - chronicle.y * LAYER_DISTANCE;

  // Endpunkt: Auf Layer 0, an der X-Position des Ast-Endes
  const endX_onLayer0 = branchEndX;
  const endY_onLayer0 = centerY; // Y-Position von Layer 0

  // Simuliere einen Ankerpunkt auf Layer 0 für die Kurve
  const endAnchorX = connectionEndpointX(endX_onLayer0, endX_onLayer0 - 10); // -10 simuliert "rückwärts"

  drawConnection(viewport, {
    startPoint: { x: startX_onBranch, y: startY_onBranch },
    endPoint: { x: endAnchorX, y: endY_onLayer0 },
    color: 0xAAAAAA, // Leichtes Grau für Fork/Merge
    thickness: CONNECTION_THICKNESS - 1, // Etwas dünner
  });
};

/**
 * Zeichnet eine horizontale Verbindung zwischen zwei Geschwister-Chronicles auf dem selben Layer.
 */
const drawSiblingConnection = (
  context: DrawingContext,
  prevChronicle: ChronicleCell,
  currentChronicle: ChronicleCell
) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;

  // Beide sind auf demselben Y-Level
  const yPos = centerY - currentChronicle.y * LAYER_DISTANCE;

  // Ende des vorherigen Elements
  const nknotsPrev = normalize(prevChronicle.$.knots, aknot, distance);
  const prevEndX = nknotsPrev[1] * screenWidth;

  // Start des aktuellen Elements
  const nknotsCurrent = normalize(currentChronicle.$.knots, aknot, distance);
  const currentStartX = nknotsCurrent[0] * screenWidth;

  // Zeichne die horizontale Verbindung
  drawConnection(viewport, {
    startPoint: { x: prevEndX, y: yPos },
    endPoint: { x: currentStartX, y: yPos },
    color: CONNECTION_COLOR, // TIPP: Ändere dies z.B. auf 0xAAAAAA (ein Grau)
    thickness: CONNECTION_THICKNESS, // TIPP: Mache dies evtl. dünner (z.B. 1)
  });
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
  }, []);

  // Effect 3: Inhalt zeichnen, wenn die Engine bereit ist
  useEffect(() => {
    const viewport = viewportRef.current;
    const container = pixiContainer.current;

    // Abbrechen, wenn Engine oder Viewport nicht bereit sind
    if (!isEngineReady || !viewport || !container) {
      return;
    }

    viewport.removeChildren(); // Vorherige Zeichnungen löschen

    const drawingTasks: (() => void)[] = [];
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

    const processLevel = (level: ChronicleCell[] | undefined) => {
      if (!level || level.length === 0) return;

      level.forEach((chronicle, j, arr) => {
        if (!chronicle) {
          console.warn("Skipping undefined chronicle at index", j);
          return;
        }

        // HIER ÄNDERUNG: Nicht direkt zeichnen, sondern Task zur Liste hinzufügen
        drawingTasks.push(() => {
          drawChronicle(drawingContext, chronicle, chronicle.y);
        });

        if (chronicle.y === 0) return;

        const prevChronicle = (j > 0) ? arr[j - 1] : undefined;

        // FORK MERGE Sibling Logic
        if (prevChronicle) {
          const nknotsPrev = normalize(prevChronicle.$.knots, aknot, distance);
          const prevEndX = nknotsPrev[1] * screenWidth;

          const nknotsCurr = normalize(chronicle.$.knots, aknot, distance);
          const currStartX = nknotsCurr[0] * screenWidth;

          const gap = currStartX - prevEndX;

          if (gap > MAX_SIBLING_PIXEL_GAP) {
            // HIER ÄNDERUNG: Tasks hinzufügen
            drawingTasks.push(() => {
              drawMergeToCenterline(drawingContext, prevChronicle);
            });
            if (!chronicle.prev) {
              drawingTasks.push(() => {
                drawForkFromCenterline(drawingContext, chronicle);
              });
            }
          } else {
            // HIER ÄNDERUNG: Task hinzufügen
            drawingTasks.push(() => {
              drawSiblingConnection(drawingContext, prevChronicle, chronicle);
            });
          }

        } else {
          if (!chronicle.prev) {
            // HIER ÄNDERUNG: Task hinzufügen
            drawingTasks.push(() => {
              drawForkFromCenterline(drawingContext, chronicle);
            });
          }
        }

        // --- B. END-Logik (Merge) ---
        if (j === arr.length - 1) {
          if (!chronicle.next) {
            // HIER ÄNDERUNG: Task hinzufügen
            drawingTasks.push(() => {
              drawMergeToCenterline(drawingContext, chronicle);
            });
          }
        }
      });
    };

    // --- Führe die Verarbeitung für alle Level aus ---

    // Level 0 (hier gilt die Fork/Merge-Logik nicht, nur die Geschwister)
    level0?.forEach((chronicle, i, arr) => {
      // HIER ÄNDERUNG: Task hinzufügen
      drawingTasks.push(() => {
        drawChronicle(drawingContext, chronicle, chronicle.y);
      });
      if (i > 0) {
        // HIER ÄNDERUNG: Task hinzufügen
        drawingTasks.push(() => {
          drawSiblingConnection(drawingContext, chronicle.prev ? chronicle.prev : chronicle, chronicle);
        });
      }
    });

    // Positive Level
    for (let i = 0; i < positiveLayerHeight; i++) {
      processLevel(engine.current.getLevel(i + 1));
    }

    // Negative Level
    for (let i = 0; i < negativeLayerHeight; i++) {
      processLevel(engine.current.getLevel(-(i + 1)));
    }

    // --- NEU: Tasks nacheinander mit Verzögerung ausführen ---
    let taskIndex = 0;
    const intervalId = setInterval(() => {
      if (taskIndex < drawingTasks.length) {
        drawingTasks[taskIndex](); // Führe den nächsten Zeichen-Befehl aus
        taskIndex++;
      } else {
        clearInterval(intervalId); // Alle Tasks erledigt
      }
    }, 150); // Zeichne alle 50ms ein neues Element. Passe diese Zahl an!

    // WICHTIG: Cleanup-Funktion für das Interval
    // Diese wird ausgeführt, wenn die Komponente unmountet oder der Effect neu läuft
    return () => {
      clearInterval(intervalId);
    };

  }, [isEngineReady, engine]);

  return <div className="w-full h-screen" ref={pixiContainer}></div>;
}


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
*/
const connectionEndpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(length * 0.25, 75); // 25% oder maximal 75px
  return startX < endX ? startX + offset : startX - offset;
};

export default Page;