"use client";

import ChronicleSelect from "@/components/ChronicleSelect/chronicleSelect";
import DynamicView from "@/components/features/editor/DynamicView/DynamicView";
import RenderBranch from "@/utils/drawing/renderBranch";
import ButterflyStack from "@/utils/structures/ButterflyStack";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicles/readOwnChronicles";
import inferDynamicVita from "@/utils/supabase/api/vitas/dynamic/inferDynamicVita";
import { createClient } from "@/utils/supabase/client";
import { Button, Popover } from "@monolithium/next/components";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite } from "pixi.js";
import React, { useEffect, useRef, useState } from "react";

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
  console.log(stack.getLayerHeight().positive)
  const parentRef = useRef(null);
  console.log(useOwnChroniclesData())
  return <div ref={parentRef} className="size-full">

    <Application backgroundColor={"#ffffff"} resizeTo={parentRef} >

      {
        // Render Layer 0
        stack.getLayer(0).map((e) => <RenderBranch key={e.id} start={e.knots[0]} end={e.knots[1]} shift={0} ></RenderBranch>)
      }

      {
        // Render positiv Layers
        Array.from({ length: positiveLayerHeight }, (_, i) => {
          const layerIndex = i + 1; // positive layers: 1, 2, 3...
          const layer = stack.getLayer(layerIndex);

          return layer.map((e) => (
            <RenderBranch
              key={e.id}
              start={e.knots[0]}
              end={e.knots[1]}
              shift={-1 * layerIndex * 50} // positive shift (e.g. +1, +2)
            />
          ));
        })

      }


      {
        // Render negative Layers
        Array.from({ length: negativeLayerHeight }, (_, i) => {
          const layerIndex = i + 1;
          return stack.getLayer(-layerIndex).map((e) => (
            <RenderBranch key={e.id} start={e.knots[0]} end={e.knots[1]} shift={layerIndex*50} />
          ));
        })
      }


    </Application>
  </div>;
};

export default Page;
