"use client";

import React, { useEffect, useRef, useState } from "react";

import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";

import { TreeRenderer } from "@components/Tree";

import styles from "./page.module.scss";
import Chronicle from "@/utils/models/Chronicle";
import usePocketbase from "@/hooks/usePocketbase";
import ChronicleRelation from "@/utils/models/ChronicleRelation";

extend({ Graphics });

const Engine: React.FunctionComponent = () => {
  const CHRONICLE_TREE_NAME = "PogChamp";

  /** ANCHOR: References */
  const engine = useRef<HTMLDivElement>(null);
  const pocketbase = usePocketbase();

  /** ANCHOR: State */
  const [scale, setScale] = useState<number>(1);
  const [devicePixelRatio, setDevicePixelRation] = useState<number>();

  /** ANCHOR: Effects */
  useEffect(() => {
    const fetchData = async () => {
      const chronicles: ChronicleRelation[] = await pocketbase.current
        .collection("chronicles_relations")
        .getFullList({
          filter: `name="${CHRONICLE_TREE_NAME}" && parent=NULL`,
          expand: "user,chronicle,parent,children",
        });
      console.log(chronicles);
    };
    fetchData();
  }, [pocketbase]);

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
        ></Application>
      )}
    </div>
  );
};

export default Engine;
