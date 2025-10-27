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

function Page() {
  /** ANCHOR: References */
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null); // Ref for the app
  const viewportRef = useRef<Viewport | null>(null);

  /** ANCHOR: Fetched Data */
  const { chronicles: ownChronicles, isLoading } = useReadOwnChronicles();

  /** ANCHOR: Engines */
  const { init, engine } = useEngine();
  const [isEngineReady, setEngineReady] = useState(false); // State to track engine readiness

  useEffect(() => {
    if (!isLoading && ownChronicles.length > 0) {
      console.warn("Engine activated");
      const { linear } = filterChronicles(ownChronicles);
      console.log("Linear Chronicles:", linear);
      init(linear);
      setEngineReady(true); // Signal that the engine has been initialized
    }
  }, [ownChronicles, init]);



  // Effect 1: Initialize Pixi Application and Viewport (runs only once)
  useEffect(() => {
    if (!pixiContainer.current || appRef.current) {
      return; // Abort if container is not ready or app is already initialized
    }

    const app = new Application();
    appRef.current = app;

    const initializePixi = async () => {
      await app.init({
        resizeTo: pixiContainer.current!,
        backgroundColor: 0xffffff,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      pixiContainer.current!.appendChild(app.canvas);

      const viewport = new Viewport({
        screenWidth: pixiContainer.current!.clientWidth,
        screenHeight: pixiContainer.current!.clientHeight,
        worldWidth: 1000,
        worldHeight: 1000,
        events: app.renderer.events,
      });
      viewportRef.current = viewport;

      app.stage.addChild(viewport);
      viewport.drag().pinch().wheel().decelerate();
      viewport.fit().moveCenter(500, 500);
    };

    initializePixi();

    return () => {
      app.destroy(true, true);
      appRef.current = null;
      viewportRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once



  // Effect 2: Draw content when the engine is ready (or data changes)
  useEffect(() => {
    if (!isEngineReady || !viewportRef.current) {
      return; // Abort if engine isn't ready or viewport is not set up
    }

    //Viewport define
    const viewport = viewportRef.current;
    viewport.removeChildren(); // Clear previous drawings

    let aknot = 0;
    let distance = 1; // Avoid division by zero

    if (engine.current.getLevel(0) != null) {
      aknot = engine.current.get(0, 0)?.$.knots.start ?? 0;
      const lastKnot =
        engine.current.getLastCell(0)?.$.knots.end ?? aknot;
      distance = lastKnot - aknot;
      if (distance === 0) distance = 1;
    }

    const positiveLayerHeight = engine.current.yDimensions.positive;
    const negativeLayerHeight = engine.current.yDimensions.negative;

    const isRenderedChronicles = new Set<string>();


    /*
    This Function starts the drawing of one Chonicle.
    One Chronicle can Contain multiple Branches. 
    So it needs to be able to call itself recursivly until all Branches are drawn.
    */

    const drawChronicles = (
      chronicle: ButterflyCell<{ id: string, knots: { start: number; end: number; } }>,
      levelIndex: number) => {

      //Draw Previous Logic:
      const drawPreviousChronicles = (
        nextChronicle: ButterflyCell<{ id: string, knots: { start: number; end: number; } }>,
        chronicle: ButterflyCell<{ id: string, knots: { start: number; end: number; } }>,
        prevlevelIndex: number
      ) => {

        const nknots = normalize(nextChronicle.$.knots, aknot, distance);
        const nknotsPrev = normalize(chronicle.$.knots, aknot, distance);

        const StartX = nknotsPrev[0] * window.innerWidth;
        const EndX = nknotsPrev[1] * window.innerWidth;

        const nextStartX = nknots[0] * window.innerWidth;
        const nextEndX = nknots[1] * window.innerWidth;

        const nextConnStartX = connectionEndpointX(nextStartX, nextEndX);
        const ConnEndX = connectionEndpointX(EndX, StartX);


        //Drawing the connection and the Branch on Screen then if another previous exist do it also for it
        drawConnection(viewport, {
          startPoint: { x: nextConnStartX, y: window.innerHeight / 2 - nextChronicle.y * 50 },
          endPoint: { x: ConnEndX, y: window.innerHeight / 2 - chronicle.y * 50 },
          color: 0xFF0000,
          thickness: 2
        });
        drawBranch(viewport, {
          start: nknotsPrev[0] * window.innerWidth,
          end: nknotsPrev[1] * window.innerWidth,
          shift: window.innerHeight / 2 - prevlevelIndex * 50,
          title: "t",
        });


        if (chronicle.prev) {
          drawPreviousChronicles(chronicle, chronicle.prev, chronicle.prev.y);
        }
      };

      //Draw Next Logic:
      const drawNextChronicles = (
        prevChronicle: ButterflyCell<{ id: string, knots: { start: number; end: number; } }>,
        chronicle: ButterflyCell<{ id: string, knots: { start: number; end: number; } }>
      ) => {
        const nknots = normalize(prevChronicle.$.knots, aknot, distance);
        const nknotsNext = normalize(chronicle.$.knots, aknot, distance);

        const nextStartX = nknots[0] * window.innerWidth;
        const nextEndX = nknotsNext[1] * window.innerWidth;
        const nextConnEndX = connectionEndpointX(nextEndX, nextStartX);



        //Drawing the connection and the Branch on Screen then if another previous exist do it also for it
        drawConnection(viewport, {
          startPoint: { x: nknots[0] * window.innerWidth, y: window.innerHeight / 2 - prevChronicle.y * 100 },
          endPoint: { x: nextConnEndX, y: window.innerHeight / 2 - chronicle.y * 100 },
          color: 0xFF0000,
          thickness: 2
        });
        drawBranch(viewport, {
          start: nknotsNext[0] * window.innerWidth,
          end: nknotsNext[1] * window.innerWidth,
          shift: window.innerHeight / 2 - chronicle.y * 100,
          title: "t",
        });
        if (chronicle.next) {
          drawNextChronicles(chronicle, chronicle.next);
        } else {
          chronicle.flag = () => true

        }
      };

      if (isRenderedChronicles.has(chronicle.$.id.toString())) return;


      //Drawing the Branch on the Screen only if is unflagged!
      if (!chronicle.isFlagged) {
        const nknots = normalize(chronicle.$.knots, aknot, distance);
        drawBranch(viewport, {
          start: nknots[0] * window.innerWidth,
          end: nknots[1] * window.innerWidth,
          shift: window.innerHeight / 2 - levelIndex * 50,
          title: "t",
        });

        if (chronicle.prev && !chronicle.isFlagged) {
          drawPreviousChronicles(chronicle, chronicle.prev, chronicle.prev.y)
        }

        if (chronicle.next && !chronicle.isFlagged) {
          drawNextChronicles(chronicle, chronicle.next)
        } else {
          chronicle.flag = () => true
        }
      }


    };

    // Render level 0
    engine.current.getLevel(0)?.forEach((chronicle, i, arr) => {
      console.log("chronicle:", chronicle.$.id);
      const nknots = normalize(chronicle.$.knots, aknot, distance);
      let start = nknots[0] * window.innerWidth;
      let end = nknots[1] * window.innerWidth;

      if (arr.length === 1) {
        start = 0;
        end = window.innerWidth;
      } else if (i === 0) {
        start = 0;
      } else if (i === arr.length - 1) {
        end = window.innerWidth;
      }

      drawChronicles(chronicle, chronicle.y);

      chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
    });

    // Render positive levels
    for (let i = 0; i < positiveLayerHeight; i++) {
      const levelIndex = i + 1;
      const level = engine.current.getLevel(levelIndex);
      level?.forEach((chronicle) => {
        if (isRenderedChronicles.has(chronicle.$.id.toString())) return;
        drawChronicles(chronicle, chronicle.y);
        chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
      });

    }

    // Render negative levels
    for (let i = 0; i < negativeLayerHeight; i++) {
      const levelIndex = i - 1;
      const level = engine.current.getLevel(-levelIndex);
      level?.forEach((chronicle) => {
        if (isRenderedChronicles.has(chronicle.$.id.toString())) return;
        chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
      });
    }

  }, [isEngineReady]);

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
 * Compute connection endpoint X for a branch.
 * - If branch length <= 300px: use 25% of length
 * - If branch length > 300px: use 75px
 *
 * @param startX left or source x coordinate
 * @param endX right or target x coordinate
 * @returns x coordinate for connection endpoint starting from startX toward endX
 */
const connectionEndpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(length * 0.25, 75); // 25% or cap at 75px
  return startX < endX ? startX + offset : startX - offset;
};

export default Page;

