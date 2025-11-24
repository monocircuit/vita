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
const BRANCH_THICKNESS = 4;
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
  //isRenderedChronicles: Set<string>;
};

// --- Hilfsfunktionen für das Zeichnen (ausgelagert) ---
/**
 * Hauptfunktion zum Zeichnen einer einzelnen Chronicle und Anstoßen der
 * rekursiven Zeichnung von 'prev' und 'next'.
 */
const drawChronicleBranch = (
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
    //isRenderedChronicles,
  } = context;


  // Überspringen, falls bereits gerendert (obwohl bei neuer Logik evtl. unnötig)
  //if (isRenderedChronicles.has(chronicle.$.id.toString())) return;
  console.log("Drawing Chronicle:", chronicle.$);
  // Nur zeichnen, wenn nicht geflaggt
  if (!chronicle.isFlagged) {
    const nknots = normalize(chronicle.$.knots, aknot, distance);

    // Den Haupt-Ast (Branch) für diese Chronicle zeichnen
    const test = drawBranch(viewport, {
      start: nknots[0] * screenWidth,
      end: nknots[1] * screenWidth,
      shift: centerY - levelIndex * LAYER_DISTANCE,
      title: chronicle.$.id,
      color: Math.floor(Math.random() * 0xFFFFFF),
      thickness: BRANCH_THICKNESS,
    });

    test.onclick = () => {
      console.log("Clicked on branch of Chronicle:");
    }
    test.interactive = true;
  }
  //chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
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

    const screenWidth = container.clientWidth;
    const screenHeight = container.clientHeight;
    const centerY = screenHeight / 2;

    const drawingContext: DrawingContext = {
      viewport,
      aknot,
      distance,
      screenWidth,
      centerY,
      //isRenderedChronicles: new Set<string>(),
    };

    const allChroniclesByLevel = new Map<number, ChronicleCell[]>();
    const allChronicles: ChronicleCell[] = [];

    const level0 = engine.current.getLevel(0) as ChronicleCell[] | undefined;
    if (level0) {
      allChroniclesByLevel.set(0, Array.from(level0)); // <-- KORREKTUR: In Array umwandeln
      allChronicles.push(...level0);
    }

    // Positive Level
    const positiveLayerHeight = engine.current.yDimensions.positive;
    for (let i = 0; i < positiveLayerHeight; i++) {
      const level = engine.current.getLevel(i + 1) as ChronicleCell[] | undefined;
      if (level) {
        allChroniclesByLevel.set(i + 1, Array.from(level)); // <-- KORREKTUR: In Array umwandeln
        allChronicles.push(...level);
      }
    }
    // Negative Level
    const negativeLayerHeight = engine.current.yDimensions.negative;
    for (let i = 0; i < negativeLayerHeight; i++) {
      const level = engine.current.getLevel(-(i + 1)) as ChronicleCell[] | undefined;
      if (level) {
        allChroniclesByLevel.set(-(i + 1), Array.from(level)); // <-- KORREKTUR: In Array umwandeln
        allChronicles.push(...level);
      }
    }


    if (level0 && level0.length > 0) {
      // Stelle sicher, dass auf $ und knots geprüft wird
      const firstCell = engine.current.get(0, 0);
      const lastCell = engine.current.getLastCell(0);

      if (firstCell && firstCell.$ && lastCell && lastCell.$) {
        drawingContext.aknot = firstCell.$.knots.start;
        const lastKnot = lastCell.$.knots.end;
        drawingContext.distance = lastKnot - drawingContext.aknot;
        if (drawingContext.distance === 0) drawingContext.distance = 1;
      }
    }

    // ========== PASS 1: Alle Äste (Branches) zeichnen ==========
    // Wir verwenden `allChronicles`, um JEDEN Ast genau einmal zu zeichnen.

    console.log(allChronicles)
    allChronicles.forEach((chronicle) => {
      console.log(chronicle.cell);

      if (chronicle.cell) {
        drawChronicleBranch(drawingContext, chronicle.cell, chronicle.cell.y);
      }
    });

    // ========== PASS 2: Alle Verbindungen (Connections) zeichnen (NEUE LOGIK) ==========
    allChroniclesByLevel.forEach((level, levelY) => {
      if (!level || level.length === 0) return;

      level.forEach((chronicle, j, arr) => {
        // Robuste Prüfung
        if (!chronicle || !chronicle.$) return;

        // --- Fall A: Sonderbehandlung für Layer 0 (Hauptachse) ---
        if (levelY === 0) {
          // Auf Layer 0 wollen wir nur Sibling-Verbindungen, wenn sie nah genug sind
          if (j > 0) {
            const prevChronicle = arr[j - 1];
            if (prevChronicle && prevChronicle.$) {
              // Berechne den Gap
              const nknotsPrev = normalize(prevChronicle.$.knots, drawingContext.aknot, drawingContext.distance);
              const prevEndX = nknotsPrev[1] * screenWidth;
              const nknotsCurr = normalize(chronicle.$.knots, drawingContext.aknot, drawingContext.distance);
              const currStartX = nknotsCurr[0] * screenWidth;
              const gap = currStartX - prevEndX;

              // Regel: Verbinde, wenn Abstand klein genug
              if (gap <= MAX_SIBLING_PIXEL_GAP) {
                drawSiblingConnection(drawingContext, prevChronicle, chronicle);
              }
              // Wenn der Gap groß ist, passiert auf Layer 0 nichts.
            }
          }
        }

        // --- Fall B: Logik für alle anderen Layer (Layer != 0) ---
        else {

          // Regel 1: Erster Branch im Layer
          if (j === 0) {
            // "Wenn der Branch der erste in einem Layer ist erstelle einen Fork"
            drawForkFromCenterline(drawingContext, chronicle);
          }

          // KORREKTUR: Debug-console.log entfernt und ursprüngliche Logik wiederhergestellt
          // Regel 2: Alle folgenden Branches
          else {
            // Wir *müssen* einen prevChronicle haben, da j > 0
            // Dies funktioniert jetzt, da 'arr' ein echtes Array ist.
            const prevChronicle = arr[j - 1];
            if (!prevChronicle || !prevChronicle.$) return; // Sicherheits-Check

            // Berechne den Gap zum Vorgänger
            const nknotsPrev = normalize(prevChronicle.$.knots, drawingContext.aknot, drawingContext.distance);
            const prevEndX = nknotsPrev[1] * screenWidth;
            const nknotsCurr = normalize(chronicle.$.knots, drawingContext.aknot, drawingContext.distance);
            const currStartX = nknotsCurr[0] * screenWidth;
            const gap = currStartX - prevEndX;

            // Regel 2a: Kleiner Gap
            if (gap <= MAX_SIBLING_PIXEL_GAP) {
              // "verbinde wenn der Abstand klein genug die Branches jeweils auf einer Linie."
              drawSiblingConnection(drawingContext, prevChronicle, chronicle);
            }
            // Regel 2b: Großer Gap
            else {
              // "Dann merge wieder auf den abgeleiteten Branch zurück..."
              drawMergeToCenterline(drawingContext, prevChronicle);
              // "...und Forke wieder neu"
              drawForkFromCenterline(drawingContext, chronicle);
            }
          }

          // Regel 3: Letzter Branch im Layer muss immer mergen
          if (j === arr.length - 1) {
            // Der "Abstand zum Nächsten" ist unendlich groß, also mergen.
            drawMergeToCenterline(drawingContext, chronicle);
          }
        }
      });
    });
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



const connectionEndpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(length * 0.25, 75); // 25% oder maximal 75px
  return startX < endX ? startX + offset : startX - offset;
};

export default Page;