"use client";

import React, { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import useEngine from "@/utils/processing/engines/dynamic/useEngine";
import { drawBranch } from "@/utils/drawing/dynamic/drawBranch";
import { Viewport } from "pixi-viewport";
import { ButterflyCell } from "@/utils/structures/Butterfly";
import {
  oTLinearChronicle,
  useReadOwnChronicles,
} from "@/utils/supabase/api/tables/chronicles";
import filterChronicles from "@/utils/processing/data/chronicles/filterChronicles";

function Page() {
  /** ANCHOR: References */
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null); // Ref for the app
  const viewportRef = useRef<Viewport | null>(null);

  /** ANCHOR: Fetched Data */
  const { chronicles: ownChronicles } = useReadOwnChronicles();

  /** ANCHOR: Engines */
  const { init, engine } = useEngine();
  const [isEngineReady, setEngineReady] = useState(false); // State to track engine readiness
  const [isAppInitialized, setAppInitialized] = useState(false); // State to track app initialization

  useEffect(() => {
    if (ownChronicles && ownChronicles.length > 0) {
      console.warn("Engine activated");

      const { linear } = filterChronicles(ownChronicles);

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
      const lastKnot = engine.current.getLastCell(0)?.$.knots.end ?? aknot;
      distance = lastKnot - aknot;
      if (distance === 0) distance = 1;
    }

    const positiveLayerHeight = engine.current.yDimensions.positive;
    const negativeLayerHeight = engine.current.yDimensions.negative;

    const isRenderedChronicles = new Set<string>();

    const drawChronicles = (
      chronicle: oTLinearChronicle,
      levelIndex: number,
    ) => {
      if (isRenderedChronicles.has(chronicle.id.toString())) return;

      const nknots = normalize(chronicle.knots, aknot, distance);
      drawBranch(viewport, {
        start: nknots[0] * window.innerWidth,
        end: nknots[1] * window.innerWidth,
        shift: window.innerHeight / 2 - levelIndex * 50,
        title: chronicle.title,
      });
      isRenderedChronicles.add(chronicle.id.toString());
    };

    const drawPreviousChronicles = (
      chronicle: ButterflyCell<oTLinearChronicle>,
      levelIndex: number,
    ) => {
      drawChronicles(chronicle.$, levelIndex);
      if (chronicle.prev) {
        drawPreviousChronicles(chronicle.prev, levelIndex + 1);
      }
    };

    const drawNextChronicles = (
      chronicle: ButterflyCell<oTLinearChronicle>,
      levelIndex: number,
    ) => {
      drawChronicles(chronicle.$, levelIndex);
      if (chronicle.prev) {
        drawPreviousChronicles(chronicle.prev, levelIndex + 1);
      }
    };

    // Render level 0
    engine.current.getLevel(0)?.forEach((cell, i, arr) => {
      console.log("chronicle:", cell.$.id);
      const nknots = normalize(cell.$.knots, aknot, distance);
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

      drawBranch(viewport, {
        start,
        end,
        shift: window.innerHeight / 2,
        title: cell.$.title,
      });

      if (cell.prev) {
        drawPreviousChronicles(cell.prev, 1);
        console.log("Draw Previous");
      }
      if (cell.next) {
        drawNextChronicles(cell.next, -1);
        console.log("Draw Next");
      }

      cell.$.id && isRenderedChronicles.add(cell.$.id.toString());
    });

    // Render positive levels
    for (let i = 0; i < positiveLayerHeight; i++) {
      const levelIndex = i + 1;
      const level = engine.current.getLevel(levelIndex);
      level?.forEach(chronicle => {
        if (isRenderedChronicles.has(chronicle.$.id.toString())) return;

        drawChronicles(chronicle.$, levelIndex);

        if (chronicle.prev) {
          drawPreviousChronicles(chronicle.prev, levelIndex + 1);
          console.log("Draw Previous");
        }

        if (chronicle.next) {
          drawNextChronicles(chronicle.next, levelIndex - 1);
          console.log("Draw Next");
        }

        chronicle.$.id && isRenderedChronicles.add(chronicle.$.id.toString());
      });

      //Chronicle schon zu ende gerendert?
      //Chronicle previous
      //Renderfunktion für Previous
      //Bis Previous null
      //if (chronicle.prev) {
      //  drawPreviousChronicles(chronicle.prev, levelIndex + 1)
      //}

      //Chronicle next
      //Chronicle next
      //Renderfunktion für Previous
      //Bis next null

      //if (chronicle.next) {
      //  drawNextChronicles(chronicle.next, levelIndex - 1)
      //}

      //Unzerteilt ist Id als string
      //Wenn Zerteilt dann Id-Segment als string (1-2 / 1-1)

      //Packe diese Chronicle in diese schon gerendert Liste POGGERS
    }

    // Render negative levels
    for (let i = 0; i < negativeLayerHeight; i++) {
      const levelIndex = i + 1;
      const level = engine.current.getLevel(-levelIndex);
      level?.forEach(chronicle => {
        if (isRenderedChronicles.has(chronicle.$.id.toString())) return;
        const nknots = normalize(chronicle.$.knots, aknot, distance);
        drawBranch(viewport, {
          start: nknots[0] * window.innerWidth,
          end: nknots[1] * window.innerWidth,
          shift: window.innerHeight / 2 + levelIndex * 50,
          title: chronicle.$.title,
        });
      });
    }
  }, [isEngineReady]);
  console.log(engine.current);

  return <div className="w-full h-full" ref={pixiContainer}></div>;
}

const normalize = (
  knots: { start: number; end: number },
  aKnot: number,
  distance: number,
) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots.start - aKnot) / distance;
  normalizedKnots[1] = (knots.end - aKnot) / distance;
  return normalizedKnots;
};

export default Page;
