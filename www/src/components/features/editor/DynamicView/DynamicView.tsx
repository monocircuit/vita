"use client";

import React, { useEffect, useRef, useState } from "react";

import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";

extend({ Graphics });

const Engine: React.FunctionComponent = () => {
  /** ANCHOR: References */
  const engine = useRef<HTMLDivElement>(null);

  /** ANCHOR: State */
  const [scale, setScale] = useState<number>(1);
  const [devicePixelRatio, setDevicePixelRation] = useState<number>();

  useEffect(() => {
    setDevicePixelRation(window.devicePixelRatio);
  }, [setDevicePixelRation]);

  /** ANCHOR: Handlers */
  const handleScroll: React.WheelEventHandler<HTMLDivElement> = event => {
    if (event.deltaY < 0) {
      setScale(scale - 0.2);
    } else {
      setScale(scale + 0.2);
    }
  };

  return (
    <div className={"size-full"} ref={engine} onWheel={handleScroll}>
      {devicePixelRatio && (
        <Application
          backgroundAlpha={0}
          resizeTo={engine}
          eventMode="dynamic"
          resolution={devicePixelRatio}
          antialias={true}
          autoDensity={true}
        ></Application>
      )}
    </div>
  );
};

export default Engine;
