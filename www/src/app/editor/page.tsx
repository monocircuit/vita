"use client";

import RenderBranch from "@/utils/drawing/renderBranch";
import RenderConnection from "@/utils/drawing/renderConnection";
import ButterflyStack from "@/utils/structures/ButterflyStack";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite } from "pixi.js";
import React, { JSX, useEffect, useRef, useState } from "react";

interface Props { }

extend({
  Container,
  Graphics,
});

const Page = (props: Props) => {
  const stack = new ButterflyStack<{
    id: string;
    label: string;
    knots: number[];
  }>();
  stack.addValue({ id: "root", label: "Root", knots: [0, 1000] }, 0); // Neutral layer

  stack.addValue({ id: "child-1", label: "Child A1", knots: [200, 600] }, 1);
  stack.addValue({ id: "child-2", label: "Child A2", knots: [650, 900] }, 1);

  stack.addValue(
    { id: "grandchild-1", label: "Grandchild A1.1", knots: [400, 520] },
    2,
  );

  stack.addValue(
    { id: "neg-child-1", label: "Child B1", knots: [350, 800] },
    -1,
  );
  stack.addValue(
    { id: "neg-child-2", label: "Child B2", knots: [900, 1000] },
    -1,
  );

  stack.addValue(
    { id: "neg-grandchild-1", label: "Grandchild B1.1", knots: [600, 900] },
    -2,
  );

  const positiveLayerHeight = stack.getLayerHeight().positive;
  const negativeLayerHeight = stack.getLayerHeight().negative;
  const parentRef = useRef(null);

  let aknot = 0;
  let distance = 0;

  // Check if Data exists
  if (stack.getLayer(0) != null || undefined) {
    //get Variables for Normalization
    aknot = stack.getLayer(0)[0].knots[0];
    distance = stack.getLayer(0).findLast(e => e)!.knots[1] - aknot; // subract last knot with first one to get the complete distance
  }

  return (
    <div ref={parentRef} className="size-full">
      <Application backgroundColor={"#ffffff"} resizeTo={parentRef}>
        {
          // Render Layer 0
          stack.getLayer(0).map(e => {
            // Check if multpiple elements is in Layer 0
            if (stack.getLayer(0).length == 1) {
              return (
                <RenderBranch
                  key={e.id}
                  start={0}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></RenderBranch>
              );
            }

            //set first elements first knot to 0 and normalize second knot
            else if (stack.getLayer(0)[0] == e) {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <RenderBranch
                  key={e.id}
                  start={0}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></RenderBranch>
              );
            }

            //normalize elements first knot and set last elements last knot to wished width
            else if (stack.getLayer(0).findLast(e => e) == e) {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <RenderBranch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></RenderBranch>
              );
            } else {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <RenderBranch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></RenderBranch>
              );
            }
          })
        }

        {
          // Render positiv Layers
          Array.from({ length: positiveLayerHeight }, (_, i) => {
            const layerIndex = i + 1; // positive layers: 1, 2, 3...
            const layer = stack.getLayer(layerIndex);

            return layer.map((e, elementIndex) => {
              const nknots = normalize(e.knots, aknot, distance);
              const overtakeWidth = calculateOvertakeWidth(nknots[1] - nknots[0]);
              
              // Find the next element on the same layer
              const nextElement = layer[elementIndex + 1];

              // Determine where the end of the current branch should connect to
              const endPoint = determineConnectionEndPoint(
                e.knots, // Use original knots for distance calculation
                nextElement,
                layerIndex,
                overtakeWidth
              );

              // We need to normalize the x coordinate for rendering
              const normalizedEndPointX = (endPoint.x - aknot) / distance * window.innerWidth;

              return (
                <React.Fragment key={e.id}>
                  <RenderConnection
                    startPoint={{
                      x: nknots[0] * window.window.innerWidth,
                      y: window.innerHeight / 2 - i * 50,
                    }}
                    endPoint={{
                      x: nknots[0] * window.window.innerWidth + overtakeWidth,
                      y: window.innerHeight / 2 + -1 * layerIndex * 50,
                    }}
                    thickness={2}
                    color={0xff0000}
                  />
                  <RenderBranch
                    key={e.id}
                    start={nknots[0] * window.window.innerWidth + overtakeWidth}
                    end={nknots[1] * window.window.innerWidth}
                    shift={window.innerHeight / 2 + -1 * layerIndex * 50} // positive shift (e.g. +1, +2)
                  />
                  <RenderConnection
                    startPoint={{
                      x: nknots[1] * window.window.innerWidth,
                      y: window.innerHeight / 2 + -1 * layerIndex * 50,
                    }}
                    endPoint={{
                      x: nknots[1] * window.window.innerWidth + overtakeWidth,
                      y: window.innerHeight / 2 - i * 50,
                    }}
                    thickness={2}
                    color={0xff0000}
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
            return stack.getLayer(-layerIndex).map(e => {
              const nknots = normalize(e.knots, aknot, distance);
              console.log(" nknots " + nknots);
              const overtakeWidth = calculateOvertakeWidth(nknots[1] - nknots[0]);
              console.log(" overtakeWidth " + overtakeWidth)
              return (<React.Fragment key={e.id}>
                <RenderConnection
                  startPoint={{
                    x: nknots[0] * window.window.innerWidth,
                    y: window.innerHeight / 2 + i * 50,
                  }}
                  endPoint={{
                    x: nknots[0] * window.window.innerWidth + overtakeWidth,
                    y: window.innerHeight / 2 + layerIndex * 50,
                  }}
                  thickness={2}
                  color={0xff0000}
                />
                <RenderBranch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth + overtakeWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2 + layerIndex * 50}
                />
                <RenderConnection
                  startPoint={{
                    x: nknots[1] * window.window.innerWidth,
                    y: window.innerHeight / 2 + layerIndex * 50,
                  }}
                  endPoint={{
                    x: nknots[1] * window.window.innerWidth + overtakeWidth,
                    y: window.innerHeight / 2 + i * 50,
                  }}
                  thickness={2}
                  color={0xff0000}
                />
              </React.Fragment>
              );
            });
          })
        }
      </Application>
    </div>
  );
};


// Calculate the overtake width based on the length of the branch (But with normalized Values (0-1))
const calculateOvertakeWidth = (lengthOfBranch: number) => {
  if (lengthOfBranch < 0.2) return lengthOfBranch * (1 / 2) * window.window.innerWidth;
  else return 100;
}

//normalize knots based on aknot and distance --> for make rendering responsive
const normalize = (knots: number[], aKnot: number, distance: number) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots[0] - aKnot) / distance;
  normalizedKnots[1] = (knots[1] - aKnot) / distance;

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
  threshold: number = 50 // e.g., if gap is less than 50 units on the timeline
) => {
  const isPositiveLayer = layerIndex > 0;
  const parentLayerIndex = isPositiveLayer ? layerIndex - 1 : layerIndex + 1;

  // If it's the last element or the next element is too far, connect to the parent layer.
  if (!nextElement || (nextElement.knots[0] - currentKnots[1] > threshold)) {
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
