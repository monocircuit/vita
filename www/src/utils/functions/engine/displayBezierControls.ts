/* eslint-disable @typescript-eslint/no-explicit-any */
import Two from "two.js";
import { Path } from "two.js/src/path";

const displayBezierControls = (environment: Two, path: Path) => {
    path.vertices.forEach((anchor, index) => {
        const dot = new Two.Circle(anchor.x, anchor.y, 2);
        dot.fill = "#00ff";
        dot.stroke = "#00ff";

        const leftHandle = new Two.Line(
            anchor.x,
            anchor.y,
            anchor.controls.left.x,
            anchor.controls.left.y
        );
        leftHandle.stroke = "#ff0000";

        const leftHandleDot = new Two.Circle(anchor.controls.left.x, anchor.controls.left.y, 2);
        leftHandleDot.fill = "#00ff";
        leftHandleDot.stroke = "#00ff";

        const rightHandle = new Two.Line(
            anchor.x,
            anchor.y,
            anchor.controls.right.x,
            anchor.controls.right.y
        );
        rightHandle.stroke = "#00ff";

        const rightHandleDot = new Two.Circle(anchor.controls.right.x, anchor.controls.right.y, 2);
        rightHandleDot.fill = "#00ff";
        rightHandleDot.stroke = "#00ff";

        if (index != 0) environment.add(leftHandle, leftHandleDot);
        environment.add(dot, rightHandle, rightHandleDot);
    });
};

export default displayBezierControls;
