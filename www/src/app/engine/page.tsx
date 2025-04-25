"use client";

import React, { useEffect, useRef } from "react";
import Two from "two.js";

import displayBezierControls from "@utilities/engine/displayBezierControls";
import { Branch } from "@utilities/engine/treeAPI";

import styles from "./page.module.scss";

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
    const branch1 = new Branch(two, 50, 400);
    const branch2 = new Branch(two, 100, 600);

    const branchd1 = new Branch(two, 50, 400);
    const branchd2 = new Branch(two, 100, 300);

    tree.addBranch(branch1);
    branch1.addBranch(branch2);

    tree.addBranch(branchd1, false);
    branchd1.addBranch(branchd2, false);

    tree.render();

    console.log(branchd1.getYAtX(10));

    two.update();
  }, []);

  return (
    <div
      className={styles["engine"]}
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
