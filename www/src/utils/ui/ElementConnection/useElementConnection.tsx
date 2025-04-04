import { RefObject, useCallback, useRef } from "react";
import styles from "./ElementConnection.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import Two from "two.js";
import getClosestPointOnRect from "@/utils/functions/domrect/getClosestPointOnRect";
import getCenterOnRect from "@/utils/functions/domrect/getCenterOnRect";
import getRelativeCoordinates from "@/utils/functions/domrect/getRelativeCoordinates";
import getRectOrigin from "@/utils/functions/domrect/getRectOrigin";

const useElementConnection = (
    anchorRef: RefObject<HTMLElement | null>,
    targetRef: RefObject<HTMLElement | null>,
    config: { dotDiameter: number; className?: string } = {
        dotDiameter: 5,
    }
) => {
    /** ANCHOR: References */
    const elementConnectionCanvas = useRef<HTMLDivElement>(null);
    const elementConnectionTwo = useRef<Two>(null);

    /** ANCHOR: ClassNames */
    const elementConnectionClassName = useClassName(config.className, styles["element-connection"]);

    /** ANCHOR: Callbacks */
    const drawElementConnection = useCallback(() => {
        if (elementConnectionCanvas.current && !elementConnectionTwo.current) {
            elementConnectionTwo.current = new Two({
                /**
                 * needs to be false in order not to interfere with other
                 * elements that have `position: absolute`.
                 */
                fullscreen: false,
                /**
                 * In order to draw svgs and not rasterized images.
                 */
                type: Two.Types.svg,
                /**
                 * If `autostart` is set to `true`, the issue with `Maximum re-renders`
                 * vanishes. Calling `two.update()` on very `drawPopoverConnection()`
                 * causes this issue.
                 */
                autostart: true,
            });
        }

        if (
            !elementConnectionCanvas.current ||
            !elementConnectionTwo.current ||
            !anchorRef.current ||
            !targetRef.current
        )
            return;

        /** Clear canvas to make a fresh start */
        elementConnectionTwo.current.appendTo(elementConnectionCanvas.current);
        elementConnectionTwo.current.clear();

        const childRect = anchorRef.current.getBoundingClientRect();
        const popoverRect = targetRef.current.getBoundingClientRect();

        /** Calculate absolute coordinates of the points */
        const childDotAbsoluteCoordinates = getClosestPointOnRect(
            childRect,
            getCenterOnRect(popoverRect)
        );
        const popoverDotAbsoluteCoordinates = getClosestPointOnRect(
            popoverRect,
            childDotAbsoluteCoordinates
        );

        /** Calculate the relative coordinates of the points */
        const childDotRelativeCoordinates = getRelativeCoordinates(
            childDotAbsoluteCoordinates,
            getRectOrigin(childRect)
        );
        const popoverDotRelativeCoordinates = getRelativeCoordinates(
            popoverDotAbsoluteCoordinates,
            getRectOrigin(childRect)
        );

        /** defining anchor points */
        const childAnchor = new Two.Anchor(
            childDotRelativeCoordinates.x,
            childDotRelativeCoordinates.y,
            -100,
            0,
            -100,
            0
        );
        const popoverAnchor = new Two.Anchor(
            popoverDotRelativeCoordinates.x,
            popoverDotRelativeCoordinates.y,
            100,
            0,
            100,
            0
        );

        /** Define connecting line */
        const connection = new Two.Path([childAnchor, popoverAnchor], false, true, false);
        connection.id = "connection";
        connection.stroke = "#000";
        connection.linewidth = 1;
        connection.noFill();

        /**  Define Dots */
        const childDot = new Two.Circle(childAnchor.x, childAnchor.y, config.dotDiameter / 2);
        childDot.id = "childDot";
        childDot.fill = "#000000";

        const popoverDot = new Two.Circle(popoverAnchor.x, popoverAnchor.y, config.dotDiameter / 2);
        popoverDot.id = "popoverDot";
        popoverDot.fill = "#000000";

        elementConnectionTwo.current.add(connection as any, childDot as any, popoverDot as any);
    }, [config.dotDiameter, anchorRef, targetRef]);

    return {
        drawElementConnection,
        connection: (
            <div className={elementConnectionClassName}>
                <div
                    className={styles["element-connection__canvas"]}
                    ref={elementConnectionCanvas}
                />
            </div>
        ),
    };
};

export default useElementConnection;
