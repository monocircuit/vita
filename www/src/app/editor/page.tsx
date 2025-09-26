"use client";

import Branch from "@/utils/drawing/dynamic/Branch";
import Connection from "@/utils/drawing/dynamic/Connection";
import Engine from "@/utils/processing/engines/dynamic/Engine";
import useEngine from "@/utils/processing/engines/dynamic/useEngine";
import Butterfly from "@/utils/structures/ButterflyStack";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicles/readOwnChronicles";
import { Application, extend, useExtend } from "@pixi/react";
import { Container, Graphics, Sprite, v8_0_0 } from "pixi.js";
import React, { JSX, useEffect, useRef, useState } from "react";
import { Viewport } from "pixi-viewport";
import ViewportWrapper from "@/components/ViewportWrapper";

const Page: React.FunctionComponent = () => {
  /** ANCHOR: PixiJS Extensions */
  useExtend({ Container, Graphics, Viewport });

  /** ANCHOR: References */
  const parentRef = useRef(null);
  const applicationRef = useRef(null);

  /** ANCHOR: Fetched Data */
  const { ownChronicles } = useOwnChroniclesData();

  /** ANCHOR: Engines */
  const { init, engine } = useEngine();

  useEffect(() => {
    if (ownChronicles) {
      console.warn("activated");
      init(ownChronicles);
    }
  }, [ownChronicles]);

  console.log("Engine isLoaded", engine.current.isLoaded());
  if (!engine.current.isLoaded()) return <></>;

  const positiveLayerHeight = engine.current.yDimensions.positive;
  const negativeLayerHeight = engine.current.yDimensions.negative;

  let aknot = 0;
  let distance = 0;

  // Check if Data exists
  if (engine.current.getLevel(0) != null || undefined) {
    //get Variables for Normalization
    aknot = engine.current.get(0, 0)?.knots.start as any;
    distance =
      (engine.current.getLastVector(0)?.value.knots.end as number) - aknot; // subract last knot with first one to get the complete distance
  }

  return (
    <div ref={parentRef} className="size-full">
      <Application
        ref={applicationRef}
        backgroundColor={"#ffffff"}
        resizeTo={parentRef}
      >
        <ViewportWrapper></ViewportWrapper>
        {
          /** Render level 0 */
          engine.current.getLevel(0)?.forEach((chronicle, i, list) => {
            /** At this point level 0 exists */

            // Check if multpiple elements is in Layer 0
            if (engine.current.getLevel(0)?.length == 1) {
              return (
                <Branch
                  key={chronicle.id}
                  start={0}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                  title={chronicle.title}
                ></Branch>
              );
            } else if (
              /** Validate that this is currently the first element */
              engine.current.get(0, 0) &&
              engine.current.get(0, 0) == chronicle
            ) {
              /** set first elements first knot to 0 and normalize second knot */
              const nknots = normalize(chronicle.knots, aknot, distance);
              return (
                <Branch
                  key={chronicle.id}
                  start={0}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                  title={chronicle.title}
                ></Branch>
              );
            }

            //normalize elements first knot and set last elements last knot to wished width
            else if (
              engine.current.getLast(0) &&
              engine.current.getLast(0) == chronicle
            ) {
              const nknots = normalize(chronicle.knots, aknot, distance);
              return (
                <Branch
                  key={chronicle.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                  title={chronicle.title}
                ></Branch>
              );
            } else {
              const nknots = normalize(chronicle.knots, aknot, distance);
              return (
                <Branch
                  key={chronicle.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                  title={chronicle.title}
                ></Branch>
              );
            }
          }) ?? <></>
        }
        {
          // Render positiv Layers
          Array.from({ length: positiveLayerHeight }, (_, i) => {
            const layerIndex = i + 1; // positive layers: 1, 2, 3...
            const layer = engine.current.getLayer(layerIndex);

            return layer.map(e => {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <React.Fragment key={e.id}>
                  <Branch
                    key={e.id}
                    start={nknots[0] * window.window.innerWidth}
                    end={nknots[1] * window.window.innerWidth}
                    shift={window.innerHeight / 2 + -1 * layerIndex * 50} // positive shift (e.g. +1, +2)
                    title={e.title}
                  />
                </React.Fragment>
              );
            });
          })
        }

        {
          // Render negative Layers
          Array.from({ length: negativeLayerHeight }, (_, i) => {
            const layerIndex = i + 1;
            return engine.current.getLayer(-layerIndex).map(e => {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <Branch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2 + layerIndex * 50}
                  title={e.title}
                />
              );
            });
          })
        }
      </Application>
    </div>
  );
};

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
