"use client";

import React, { useEffect, useRef, useState } from "react";

import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";

import styles from "./page.module.scss";

extend({ Graphics });

const Engine = () => {
  /** ANCHOR: References */
  const engine = useRef<HTMLDivElement>(null);

  /** ANCHOR: State */
  const [scale, setScale] = useState<number>(1);
  const [devicePixelRatio, setDevicePixelRation] = useState<number>();

  useEffect(() => {
    // if (!engine.current) return;
    // // Set fixed dimensions for better coordinate control
    // const width = 800;
    // const height = 600;
    // const two = new Two({
    //   width: width,
    //   height: height,
    //   autostart: true,
    // }).appendTo(engine.current);
    // two.scene.translation.set(0, height / 2);
    // const tree = new Branch(two, 50, 450);
    // const branch1 = new Branch(two, 50, 300);
    // const branch2 = new Branch(two, 100, 400);
    // const branchd1 = new Branch(two, 50, 400);
    // const branchd2 = new Branch(two, 100, 300);
    // tree.appendBranch(branch1);
    // branch1.appendBranch(branch2);
    // tree.appendBranch(branchd1, false);
    // branchd1.appendBranch(branchd2, false);
    // tree.render();
    // console.log(branchd1.getYAtX(10));
    // two.update();
  }, []);

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
    <div
      className={styles["engine"]}
      ref={engine}
      style={{
        width: "100vw",
        height: "100vh",
      }}
      onWheel={handleScroll}
    >
      {devicePixelRatio && (
        <Application
          backgroundAlpha={0}
          resizeTo={engine}
          eventMode="dynamic"
          resolution={devicePixelRatio}
          antialias={true}
          autoDensity={true}
        >
          <pixiGraphics
            scale={scale}
            draw={graphics => {
              graphics.clear();
              graphics.moveTo(0, 0);
              graphics.lineTo(0, -100);
              graphics.lineTo(150, 150);
              graphics.lineTo(240, 100);
              graphics.stroke({ color: "red", width: 2 });
              graphics.position.x = 320;
              graphics.position.y = 150;
            }}
          ></pixiGraphics>
        </Application>
      )}
    </div>
  );
};

export default Engine;
