"use client";

import Branch from "@/utils/drawing/dynamic/Branch";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { useOwnChroniclesData } from "@/utils/supabase/api/tables/chronicles/readOwnChronicles";
import {
  Application,
  extend,
  PixiReactElementProps,
  useExtend,
} from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import React, { JSX, useEffect, useRef } from "react";
import { Viewport } from "pixi-viewport";
import { LinearChronicle } from "@/shared/supabase/tables/chronicles/map";

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

  const isRenderedChronicles = new Set<string>();

  const drawChronicles = (chronicle: LinearChronicle, levelIndex: number) => {
    //Is this Chronicle already rendered?
    if (isRenderedChronicles.has(chronicle.id.toString())) {
      return <></>;
    }

    const nknots = normalize(chronicle.knots, aknot, distance);
    console.log("drawChronicles", chronicle, levelIndex);
    return (
      <React.Fragment key={chronicle.id + Math.ceil(Math.random() * 100)}>
        <Branch
          start={nknots[0] * window.innerWidth}
          end={nknots[1] * window.innerWidth}
          shift={window.innerHeight / 2 - levelIndex * 50}
          title={chronicle.title}
        />
      </React.Fragment>
    );
  };

  const drawPreviousChronicles = (
    chronicle: LinearChronicle,
    levelIndex: number,
  ) => {};

  const drawNextChronicles = (
    chronicle: LinearChronicle,
    levelIndex: number,
  ) => {};

  return (
    <div ref={parentRef} className="size-full">
      <Application
        ref={applicationRef}
        backgroundColor={"#ffffff"}
        resizeTo={parentRef}
      >
        <Viewport events={applicationRef}>
          {
            /** Render level 0 */
            engine.current
              .getLevel(0)
              ?.mapNeutralToPositive((chronicle, i) => {
                /** At this point level 0 exists */
                /** Check if multiple elements are in level 0 */
                if (engine.current.getLevel(0)?.length == 1) {
                  /** if there is only one element in level 0 */
                  return (
                    <Branch
                      key={i}
                      start={0}
                      end={window.innerWidth}
                      shift={window.innerHeight / 2}
                      title={chronicle.title}
                    ></Branch>
                  );
                }

                // set first elements first knot to 0 and normalize second knot
                else if (
                  /** Validate that this is currently the first element */
                  engine.current.get(0, 0) &&
                  engine.current.get(0, 0) == chronicle
                ) {
                  const nknots = normalize(chronicle.knots, aknot, distance);
                  return (
                    <React.Fragment>
                      <Branch
                        key={i}
                        start={0}
                        end={nknots[1] * window.innerWidth}
                        shift={window.innerHeight / 2}
                        title={chronicle.title}
                      ></Branch>
                    </React.Fragment>
                  );
                }

                // normalize elements first knot and set last elements last knot to wished width
                else if (
                  engine.current.getLastCell(0) &&
                  engine.current.getLastCell(0) == chronicle
                ) {
                  const nknots = normalize(chronicle.knots, aknot, distance);
                  return (
                    <Branch
                      key={i}
                      start={nknots[0] * window.innerWidth}
                      end={window.innerWidth}
                      shift={window.innerHeight / 2}
                      title={chronicle.title}
                    ></Branch>
                  );
                }

                // if its not the first nor the last element
                else {
                  return drawChronicles(chronicle, 0);
                }
              })
              .toArrayNeutralToPositive() ?? <></>
          }
          {
            /** Render positive levels */
            Array.from({ length: positiveLayerHeight }, (_, i) => {
              const levelIndex = i + 1; // positive levels: 1, 2, 3...
              const level = engine.current.getLevel(levelIndex);

              if (!level) return <></>;
              return (
                <>
                  {level
                    .mapNeutralToPositive(chronicle => {
                      return drawChronicles(chronicle, levelIndex);

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
                      chronicle.id &&
                        isRenderedChronicles.add(chronicle.id.toString());
                    })
                    .toArrayNeutralToPositive()}
                </>
              );
            })
          }
          {
            /** Render negative levels */
            Array.from({ length: negativeLayerHeight }, (_, i) => {
              const levelIndex = i + 1;
              const level = engine.current.getLevel(-levelIndex);

              if (!level) return <></>;

              return level
                .mapNeutralToPositive(chronicle => {
                  const nknots = normalize(chronicle.knots, aknot, distance);
                  return (
                    <React.Fragment
                      key={chronicle.id + Math.ceil(Math.random() * 100)}
                    >
                      <Branch
                        start={nknots[0] * window.innerWidth}
                        end={nknots[1] * window.innerWidth}
                        shift={window.innerHeight / 2 + levelIndex * 50}
                        title={chronicle.title}
                      />
                    </React.Fragment>
                  );
                })
                .toArrayNeutralToPositive();
            })
          }
        </Viewport>
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

/**
 * Determines the end point for a connection based on the next element in the layer.
 * @param currentKnots - The knots of the current element.
 * @param nextElement - The next element in the same layer, or undefined if it's the last.
 * @param layerIndex - The numerical index of the current layer (e.g., 1, 2, -1, -2).
 * @param overtakeWidth - The horizontal width of the connection curve.
 * @param threshold - The maximum gap between knots to be considered "small".
 * @returns The {x, y} coordinates for the end point of the connection.
 */
const determineConnectionEndPoint = (
  currentKnots: number[],
  nextElement: { knots: number[] } | undefined,
  layerIndex: number,
  overtakeWidth: number,
  threshold: number = 50, // e.g., if gap is less than 50 units on the timeline
) => {
  const isPositiveLayer = layerIndex > 0;
  const parentLayerIndex = isPositiveLayer ? layerIndex - 1 : layerIndex + 1;

  // If it's the last element or the next element is too far, connect to the parent layer.
  if (!nextElement || nextElement.knots[0] - currentKnots[1] > threshold) {
    return {
      x: currentKnots[1] + overtakeWidth,
      y: window.innerHeight / 2 + parentLayerIndex * 50,
    };
  }

  // Otherwise, connect to the start of the next element on the same layer.
  return {
    x: nextElement.knots[0],
    y: window.innerHeight / 2 + layerIndex * 50,
  };
};

export default Page;
