/* eslint-disable @typescript-eslint/no-explicit-any */
import Two from "two.js";
import { Path } from "two.js/src/path";
import { Line } from "two.js/src/shapes/line";

const BEZIER_HANDLE_LENGTH = 200;

const shortenLine = (line: Line, length: number) => {
    const [startAnchor, endAnchor] = line.vertices;

    const startVector = new Two.Vector(startAnchor.x, startAnchor.y);
    const endVector = new Two.Vector(endAnchor.x, endAnchor.y);

    const vector = Two.Vector.subtract(endVector, startVector);
    const vectorLength = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

    if (vectorLength == 0) return;

    /** Calculate unit vector (normalizing the vector) */
    vector.divideScalar(vectorLength);
    /** Scaling vector to the wished distance */
    vector.multiplyScalar(length);
    vector.add(startVector);

    endAnchor.x = vector.x;
    endAnchor.y = vector.y;
};

const displayBezierControls = (environment: Two, path: Path) => {
    path.vertices.forEach((anchor, index) => {
        const endPoints = {
            left: {
                x: anchor.relative ? anchor.x + anchor.controls.left.x : anchor.controls.left.x,
                y: anchor.relative ? anchor.y + anchor.controls.left.y : anchor.controls.left.y,
            },
            right: {
                x: anchor.relative ? anchor.x + anchor.controls.right.x : anchor.controls.right.x,
                y: anchor.relative ? anchor.y + anchor.controls.right.y : anchor.controls.right.y,
            },
        };

        const dot = new Two.Circle(anchor.x, anchor.y, 2);
        dot.fill = "#00ff";
        dot.stroke = "#00ff";

        const leftHandle = new Two.Line(anchor.x, anchor.y, endPoints.left.x, endPoints.left.y);
        leftHandle.stroke = "#ff0000";
        shortenLine(leftHandle, BEZIER_HANDLE_LENGTH);

        const leftHandleDot = new Two.Circle(leftHandle.vertices[1].x, leftHandle.vertices[1].y, 2);
        leftHandleDot.fill = "#00ff";
        leftHandleDot.stroke = "#00ff";

        const rightHandle = new Two.Line(anchor.x, anchor.y, endPoints.right.x, endPoints.right.y);
        rightHandle.stroke = "#00ff";
        shortenLine(rightHandle, BEZIER_HANDLE_LENGTH);

        const rightHandleDot = new Two.Circle(
            rightHandle.vertices[1].x,
            rightHandle.vertices[1].y,
            2
        );
        rightHandleDot.fill = "#00ff";
        rightHandleDot.stroke = "#00ff";

        if (index != 0) environment.add(leftHandle as any, leftHandleDot as any);
        environment.add(dot as any, rightHandle as any, rightHandleDot as any);
    });
};

export default displayBezierControls;
