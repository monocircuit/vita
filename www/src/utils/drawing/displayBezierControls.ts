import Two from "two.js";
import { Path } from "two.js/src/path";
import shortenLine from "@/utils/drawing/shortenLine";

const displayBezierControls = (path: Path, options?: { shorten: number }) => {
  path.vertices.forEach((anchor, index) => {
    const endVectors = {
      left: {
        x: anchor.relative
          ? anchor.x + anchor.controls.left.x
          : anchor.controls.left.x,
        y: anchor.relative
          ? anchor.y + anchor.controls.left.y
          : anchor.controls.left.y,
      },
      right: {
        x: anchor.relative
          ? anchor.x + anchor.controls.right.x
          : anchor.controls.right.x,
        y: anchor.relative
          ? anchor.y + anchor.controls.right.y
          : anchor.controls.right.y,
      },
    };

    const dot = new Two.Circle(anchor.x, anchor.y, 2);
    dot.fill = "#00ff";
    dot.stroke = "#00ff";

    const leftHandle = new Two.Line(
      anchor.x,
      anchor.y,
      endVectors.left.x,
      endVectors.left.y,
    );
    leftHandle.stroke = "#ff0000";
    if (options && options.shorten) shortenLine(leftHandle, options.shorten);

    const leftHandleDot = new Two.Circle(
      leftHandle.vertices[1].x,
      leftHandle.vertices[1].y,
      2,
    );
    leftHandleDot.fill = "#00ff";
    leftHandleDot.stroke = "#00ff";

    const rightHandle = new Two.Line(
      anchor.x,
      anchor.y,
      endVectors.right.x,
      endVectors.right.y,
    );
    rightHandle.stroke = "#00ff";
    if (options && options.shorten) shortenLine(rightHandle, options.shorten);

    const rightHandleDot = new Two.Circle(
      rightHandle.vertices[1].x,
      rightHandle.vertices[1].y,
      2,
    );
    rightHandleDot.fill = "#00ff";
    rightHandleDot.stroke = "#00ff";

    const controls = [];
    if (index != 0) controls.push(leftHandle, leftHandleDot);
    controls.push(dot, rightHandle, rightHandleDot);

    return controls;
  });
};

export default displayBezierControls;
