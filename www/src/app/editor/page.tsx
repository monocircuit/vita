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


  const stack = new ButterflyStack<{ id: string, label: string, knots: number[] }>()
  stack.addValue({ id: 'root', label: 'Root', knots: [0, 1000] }, 0); // Neutral layer

  stack.addValue({ id: 'child-1', label: 'Child A1', knots: [200, 600] }, 1);
  stack.addValue({ id: 'child-2', label: 'Child A2', knots: [650, 900] }, 1);

  stack.addValue({ id: 'grandchild-1', label: 'Grandchild A1.1', knots: [400, 520] }, 2);

  stack.addValue({ id: 'neg-child-1', label: 'Child B1', knots: [350, 800] }, -1);
  stack.addValue({ id: 'neg-child-2', label: 'Child B2', knots: [900, 1000] }, -1);

  stack.addValue({ id: 'neg-grandchild-1', label: 'Grandchild B1.1', knots: [600, 900] }, -2);

  const positiveLayerHeight = stack.getLayerHeight().positive
  const negativeLayerHeight = stack.getLayerHeight().negative
  const parentRef = useRef(null);


  let aknot = 0;
  let distance = 0;


  // Check if Data exists
  if (stack.getLayer(0) != null || undefined) {


    //get Variables for Normalization
    aknot = stack.getLayer(0)[0].knots[0];
    distance = stack.getLayer(0).findLast(e => e)!.knots[1] - aknot // subract last knot with first one to get the complete distance



  }




  return <div ref={parentRef} className="size-full">
    <Application backgroundColor={"#ffffff"} resizeTo={parentRef} >

      {
        // Render Layer 0
        stack.getLayer(0).map((e) => {
          // Check if multpiple elements is in Layer 0
          if (stack.getLayer(0).length == 1) {
            return <RenderBranch key={e.id} start={0} end={window.window.innerWidth} shift={window.innerHeight / 2} ></RenderBranch>
          }

          //set first elements first knot to 0 and normalize second knot
          else if (stack.getLayer(0)[0] == e) {
            const nknots = normalize(e.knots, aknot, distance)
            return <RenderBranch key={e.id} start={0} end={nknots[1] * window.window.innerWidth} shift={window.innerHeight / 2} ></RenderBranch>
          }

          //normalize elements first knot and set last elements last knot to wished width
          else if (stack.getLayer(0).findLast(e => e) == e) {
            const nknots = normalize(e.knots, aknot, distance)
            return <RenderBranch key={e.id} start={nknots[0] * window.window.innerWidth} end={window.window.innerWidth} shift={window.innerHeight / 2} ></RenderBranch>
          }

          else {
            const nknots = normalize(e.knots, aknot, distance)
            return <RenderBranch key={e.id} start={nknots[0] * window.window.innerWidth} end={nknots[1] * window.window.innerWidth} shift={window.innerHeight / 2} ></RenderBranch>
          }

        })
      }

      {
        // Render positiv Layers
        Array.from({ length: positiveLayerHeight }, (_, i) => {
          const layerIndex = i + 1; // positive layers: 1, 2, 3...
          const layer = stack.getLayer(layerIndex);

          return layer.map(e => {
            const nknots = normalize(e.knots, aknot, distance);
            return (<React.Fragment key={e.id}>
              <RenderConnection
                startPoint={{ x: nknots[0] * window.window.innerWidth, y: (window.innerHeight / 2) - i * 50 }}
                endPoint={{ x: nknots[0] * window.window.innerWidth +50, y: (window.innerHeight / 2) + (- 1 * layerIndex * 50) }}
                thickness={2}
                color={0xff0000} />
              <RenderBranch
                key={e.id}
                start={nknots[0] * window.window.innerWidth}
                end={nknots[1] * window.window.innerWidth}
                shift={(window.innerHeight / 2) + (- 1 * layerIndex * 50)} // positive shift (e.g. +1, +2)
              />
            </React.Fragment>)
          })


        })


      }



      {
        // Render negative Layers
        Array.from({ length: negativeLayerHeight }, (_, i) => {
          const layerIndex = i + 1;
          return stack.getLayer(-layerIndex).map((e) => {
            const nknots = normalize(e.knots, aknot, distance);
            return <RenderBranch key={e.id} start={nknots[0] * window.window.innerWidth} end={nknots[1] * window.window.innerWidth} shift={(window.innerHeight / 2) + (layerIndex * 50)} />
          }
          );
        })
      }


    </Application>
  </div>;
};

const normalize = (knots: number[], aKnot: number, distance: number) => {
  const normalizedKnots = [0, 0];
  normalizedKnots[0] = (knots[0] - aKnot) / distance;
  normalizedKnots[1] = (knots[1] - aKnot) / distance;

  return normalizedKnots;
}

export default Page;
