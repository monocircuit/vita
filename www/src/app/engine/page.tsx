"use client";

import React, { useEffect, useRef, useState } from "react";

import { Application, extend } from "@pixi/react";
import { Graphics, Container } from "pixi.js";

import { Orientation, Tree, TreeRenderer, useTree } from "@components/Tree";

import styles from "./page.module.scss";

extend({ Graphics });

const Engine = () => {
  /** ANCHOR: References */
  const engine = useRef<HTMLDivElement>(null);
  const tree = useRef<Tree>(null);

  /** ANCHOR: State */
  const [scale, setScale] = useState<number>(1);
  const [devicePixelRatio, setDevicePixelRation] = useState<number>();

  /** ANCHOR: Effects */
  useEffect(() => {
    tree.current = new Tree(0, 10);
    tree.current.addChild(10, 20, Orientation.ABOVE);
  }, [tree]);

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
          {new TreeRenderer(tree).render()}
        </Application>
      )}
    </div>
  );
};

export default Engine;
