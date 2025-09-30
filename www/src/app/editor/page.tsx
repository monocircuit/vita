"use client";

import Branch from "@/utils/drawing/dynamic/Branch";
import Connection from "@/utils/drawing/dynamic/Connection";
import Engine from "@/utils/processing/engines/dynamic/Engine";
import useEngine from "@/utils/processing/engines/dynamic/useEngine";
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
    aknot = engine.current.get(0, 0)?.$.knots.start as any;
    distance =
      (engine.current.getLastVector(0)?.value.$.knots.end as number) - aknot; // subract last knot with first one to get the complete distance
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
          engine.current
            .getLevel(0)
            ?.map((cell, i) => {
              /** At this point level 0 exists */
              /** Check if multiple elements are in level 0 */
              if (engine.current.getLevel(0)?.length == 1) {
                /** if there is only one element in level 0 */
                return (
                  <Branch
                    key={i}
                    start={0}
                    end={window.window.innerWidth}
                    shift={window.innerHeight / 2}
                    title={cell.$.title}
                  ></Branch>
                );
              }

              // set first elements first knot to 0 and normalize second knot
              else if (
                /** Validate that this is currently the first element */
                engine.current.get(0, 0) &&
                engine.current.get(0, 0) == cell
              ) {
                const nknots = normalize(cell.$.knots, aknot, distance);
                return (
                  <Branch
                    key={i}
                    start={0}
                    end={nknots[1] * window.window.innerWidth}
                    shift={window.innerHeight / 2}
                    title={cell.$.title}
                  ></Branch>
                );
              }
              // normalize elements first knot and set last elements last knot to wished width
              else if (
                engine.current.getLast(0) &&
                engine.current.getLast(0) == cell
              ) {
                const nknots = normalize(cell.$.knots, aknot, distance);
                return (
                  <Branch
                    key={i}
                    start={nknots[0] * window.window.innerWidth}
                    end={window.window.innerWidth}
                    shift={window.innerHeight / 2}
                    title={cell.$.title}
                  ></Branch>
                );
              }
              // if its not the first nor the last element
              else {
                const nknots = normalize(cell.$.knots, aknot, distance);
                return (
                  <Branch
                    key={i}
                    start={nknots[0] * window.window.innerWidth}
                    end={nknots[1] * window.window.innerWidth}
                    shift={window.innerHeight / 2}
                    title={cell.$.title}
                  ></Branch>
                );
              }
            })
            .toArray() ?? <></>
        }
        {
          /** Render positive levels */
          Array.from({ length: positiveLayerHeight }, (_, i) => {
            const levelIndex = i + 1; // positive levels: 1, 2, 3...
            const level = engine.current.getLevel(levelIndex);

            if (!level) return <></>;

            return level
              .map(chronicle => {
                const nknots = normalize(chronicle.$.knots, aknot, distance);
                return (
                  <React.Fragment
                    key={chronicle.$.id + Math.ceil(Math.random() * 100)}
                  >
                    <Branch
                      key={chronicle.$.id}
                      start={nknots[0] * window.window.innerWidth}
                      end={nknots[1] * window.window.innerWidth}
                      shift={window.innerHeight / 2 + -1 * levelIndex * 50} // positive shift (e.g. +1, +2)
                      title={chronicle.$.title}
                    />
                  </React.Fragment>
                );
              })
              .toArray();
          })
        }
        {
          /** Render negative levels */
          Array.from({ length: negativeLayerHeight }, (_, i) => {
            const levelIndex = i + 1;
            const level = engine.current.getLevel(-levelIndex);

            if (!level) return <></>;

            return level
              .map(chronicle => {
                const nknots = normalize(chronicle.$.knots, aknot, distance);
                return (
                  <React.Fragment
                    key={chronicle.$.id + Math.ceil(Math.random() * 100)}
                  >
                    <Branch
                      start={nknots[0] * window.window.innerWidth}
                      end={nknots[1] * window.window.innerWidth}
                      shift={window.innerHeight / 2 + levelIndex * 50}
                      title={chronicle.$.title}
                    />
                  </React.Fragment>
                );
              })
              .toArray();
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
