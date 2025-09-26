import Engine from "@/utils/processing/engines/dynamic/Engine";
import { Application } from "@pixi/react";
import React, { useEffect, useRef } from "react";
import Branch from "./Branch";
import { ButterflyStackDimensions } from "@/utils/structures/ButterflyStack";

interface Props {
  engine: Engine;
}

const Diagramm = ({ engine }: Props) => {
  /** ANCHOR: References */
  const parentRef = useRef<HTMLDivElement>(null);
  const engineLayerHeight = useRef<ButterflyStackDimensions>(null);

  useEffect(() => {
    if (engine.isLoaded()) {
      engineLayerHeight.current = engine.getDimensions();
    }
  }, [engine]);

  return (
    <div ref={parentRef} className="size-full">
      <Application backgroundColor={"#ffffff"} resizeTo={parentRef}>
        {
          // Render Layer 0
          engine.getLayer(0).map(e => {
            // Check if multpiple elements is in Layer 0
            if (engine.getLayer(0).length == 1) {
              return (
                <Branch
                  key={e.id}
                  start={0}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></Branch>
              );
            }

            //set first elements first knot to 0 and normalize second knot
            else if (engine.getLayer(0)[0] == e) {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <Branch
                  key={e.id}
                  start={0}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></Branch>
              );
            }

            //normalize elements first knot and set last elements last knot to wished width
            else if (engine.getLayer(0).findLast(e => e) == e) {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <Branch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></Branch>
              );
            } else {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <Branch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2}
                ></Branch>
              );
            }
          })
        }

        {
          // Render positiv Layers
          Array.from({ length: positiveLayerHeight }, (_, i) => {
            const layerIndex = i + 1; // positive layers: 1, 2, 3...
            const layer = butterflyStack.getLayer(layerIndex);

            return layer.map(e => {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <React.Fragment key={e.id}>
                  <RenderConnection
                    startPoint={{
                      x: nknots[0] * window.window.innerWidth,
                      y: window.innerHeight / 2 - i * 50,
                    }}
                    endPoint={{
                      x: nknots[0] * window.window.innerWidth + 50,
                      y: window.innerHeight / 2 + -1 * layerIndex * 50,
                    }}
                    thickness={2}
                    color={0xff0000}
                  />
                  <RenderBranch
                    key={e.id}
                    start={nknots[0] * window.window.innerWidth}
                    end={nknots[1] * window.window.innerWidth}
                    shift={window.innerHeight / 2 + -1 * layerIndex * 50} // positive shift (e.g. +1, +2)
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
            return butterflyStack.getLayer(-layerIndex).map(e => {
              const nknots = normalize(e.knots, aknot, distance);
              return (
                <RenderBranch
                  key={e.id}
                  start={nknots[0] * window.window.innerWidth}
                  end={nknots[1] * window.window.innerWidth}
                  shift={window.innerHeight / 2 + layerIndex * 50}
                />
              );
            });
          })
        }
      </Application>
    </div>
  );
};

export default Diagramm;
