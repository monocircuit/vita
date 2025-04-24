"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";
import scss from "./page.module.scss";
import displayBezierControls from "@/utils/engine/displayBezierControls";

const Engine = () => {
  const engine = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!engine.current) return;

    // Set fixed dimensions for better coordinate control
    const width = 800;
    const height = 600;

    const two = new Two({
      width: width,
      height: height,
      autostart: true,
    }).appendTo(engine.current);

    two.scene.translation.set(0, height / 2);

    const tree = new Branch(two, 50, 450);
    const branch1 = new Branch(two, 50, 200);
    const branch2 = new Branch(two, 50, 200);
    const branch3 = new Branch(two, 20, 100);

    const branchd1 = new Branch(two, 20, 100);
    const branchd2 = new Branch(two, 20, 200);
    const branchd3 = new Branch(two, 40, 300);

    tree.addBranch(branch1);
    branch1.addBranch(branch2);
    branch2.addBranch(branch3);
    tree.addBranch(branchd1, false);
    branchd1.addBranch(branchd2, true);
    branchd1.addBranch(branchd3, false);

    console.log(branch1.getLayerWidth());
    console.log(branch2.getLayerWidth());
    console.log(branch3.getLayerWidth());

    tree.render();
    console.log(tree.getMainBranch());

    two.update();
  }, []);

  return (
    <div
      className={scss["engine"]}
      ref={engine}
      style={{
        width: "100%",
        height: "100vh",
        background: "#f0f0f0",
      }}
    ></div>
  );
};

export default Engine;
