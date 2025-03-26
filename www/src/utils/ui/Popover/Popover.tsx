import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";

import scss from "./Popover.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import createChildMutator from "@/utils/react/createChildMutator";
import { Coordinates } from "@/utils/types/types";
import { produce } from "immer";
import { mergeRefs } from "react-merge-refs";
import Two from "two.js";
import displayBezierControls from "@/utils/engine/displayBezierControls";
import getClosestPointOnRect from "@/utils/functions/domrect/getClosestPointOnRect";
import getCenterOnRect from "@/utils/functions/domrect/getCenterOnRect";
import getRelativeCoordinates from "@/utils/functions/domrect/getRelativeCoordinates";
import getRectOrigin from "@/utils/functions/domrect/getRectOrigin";
import PassRelativeMouseCoordinates from "../PassMouseCoordinates/PassMouseCoordinates";
import Flap from "../Flap/Flap";
import { useStateWithCallbackLazy } from "use-state-with-callback";

type Props = {
    content: React.ReactNode;
    children: React.ReactElement<any, any>;
    isActive?: boolean;
    className?: string;
    config?: {
        pushTo?: "left" | "right" | "top" | "bottom";
        isConnected?: boolean;
        isDraggable?: boolean;
    };
};

type PopoverState = {
    position: Coordinates;
    isVisible: boolean;
};

type DragHandleState = {
    isHovering: boolean;
    isPressing: boolean;
};

const Popover: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>> =
    forwardRef(({ config = {}, ...props }, ref) => {
        /** ANCHOR: Constants */
        const CONNECTING_DOT_DIAMETER = 6;
        const PUSH_DISTANCE = 100;

        /** ANCHOR: References */
        /** Mandatory References */
        const popover = useRef<HTMLDivElement>(null);
        const popoverPosition = useRef<Coordinates>(null);

        const child = useRef<HTMLElement>(null);
        /** Connection References */
        const popoverConnectionTwo = useRef<Two>(null);
        const popoverConnectionCanvas = useRef<HTMLDivElement>(null);

        /** ANCHOR: State */
        const [popoverState, setPopoverState] = useStateWithCallbackLazy<PopoverState>({
            isVisible: false,
            position: { x: 0, y: 0 },
        });
        const [popoverDragHandleState, setPopoverDragHandleState] = useState<DragHandleState>({
            isHovering: false,
            isPressing: false,
        });

        /** ANCHOR: ClassName */
        const popupClassName = useClassName(scss["popover"], props.className);

        /** ANCHOR: Callbacks */
        const drawPopoverConnection = useCallback(() => {
            /** If the TwoJS canvas has not yet been initialized, initialize it */
            if (!popoverConnectionTwo.current) {
                if (!popoverConnectionCanvas.current) return;
                popoverConnectionTwo.current = new Two({
                    /**
                     * needs to be false in order not to interfere with other
                     * elements that have `position: absolute`.
                     */
                    fullscreen: false,
                    type: Two.Types.svg,
                    /**
                     * If `autostart` is set to `true`, the issue with `Maximum re-renders`
                     * vanishes. Calling `two.update()` on very `drawPopoverConnection()`
                     * causes this issue.
                     */
                    autostart: true,
                }).appendTo(popoverConnectionCanvas.current);
            }

            if (!popoverConnectionTwo.current || !child.current || !popover.current) return;
            /** Clear canvas to make a fresh start */
            popoverConnectionTwo.current.clear();

            const childRect = child.current.getBoundingClientRect();
            const popoverRect = popover.current.getBoundingClientRect();

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
            const childDot = new Two.Circle(
                childAnchor.x,
                childAnchor.y,
                CONNECTING_DOT_DIAMETER / 2
            );
            childDot.id = "childDot";
            childDot.fill = "#000000";

            const popoverDot = new Two.Circle(
                popoverAnchor.x,
                popoverAnchor.y,
                CONNECTING_DOT_DIAMETER / 2
            );
            popoverDot.id = "popoverDot";
            popoverDot.fill = "#000000";

            popoverConnectionTwo.current.add(connection as any, childDot as any, popoverDot as any);
        }, []);

        /** ANCHOR: Effects */
        /**
         * This effect handles the popover coordinates when it is initialized
         * or in other words, here the popup is pushed away from the child.
         */
        useEffect(() => {
            if (!popover.current || !child.current) return;
            const popoverRect = popover.current.getBoundingClientRect();
            const popoverCoordinates = { x: 0, y: 0 };

            switch (config.pushTo) {
                case "top":
                    popoverCoordinates.x = 0;
                    popoverCoordinates.y = -(popoverRect.height + PUSH_DISTANCE);
                    break;
                case "bottom":
                    popoverCoordinates.x = 0;
                    popoverCoordinates.y = popoverRect.height + PUSH_DISTANCE;
                    break;
                case "left":
                    popoverCoordinates.x = -(popoverRect.width + PUSH_DISTANCE);
                    popoverCoordinates.y = 0;
                    break;
                case "right":
                    popoverCoordinates.x = popoverRect.width + PUSH_DISTANCE;
                    popoverCoordinates.y = 0;
                    break;
            }

            popoverPosition.current = popoverCoordinates;

            setPopoverState(
                (prevState) =>
                    produce(prevState, (draft) => {
                        draft.position = popoverCoordinates;
                    }),
                /**
                 * When the setState is finished and the changes have rendered,
                 * draw the connection.
                 */
                () => {
                    setPopoverState(
                        (prevState) =>
                            produce(prevState, (draft) => {
                                draft.isVisible = true;
                            }),
                        () => {}
                    );
                    drawPopoverConnection();
                }
            );
        }, [props.isActive, config.pushTo, drawPopoverConnection, setPopoverState]);

        useEffect(() => {
            if (popoverConnectionTwo.current && popoverConnectionCanvas.current) {
                popoverConnectionTwo.current.appendTo(popoverConnectionCanvas.current);
            }
        }, [props.isActive]);

        /** ANCHOR: Handlers */
        const handleDragHandleMouseEnter: React.MouseEventHandler<HTMLDivElement> = () => {
            setPopoverDragHandleState((prevState) =>
                produce(prevState, (draft) => {
                    draft.isHovering = true;
                })
            );

            if (!popoverDragHandleState.isPressing) document.body.style.cursor = "grab";
        };

        const handleDragHandleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
            setPopoverDragHandleState((prevState) =>
                produce(prevState, (draft) => {
                    draft.isHovering = false;
                })
            );
        };

        const handleDragHandleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
            /** Start Flap Animation */
            setPopoverDragHandleState((prevState) =>
                produce(prevState, (draft) => {
                    draft.isPressing = true;
                })
            );

            if (config.isDraggable) {
                /** Set the cursor type to `grabbing` */
                document.body.style.cursor = "grabbing";
                /**  Turn off text selection for entire document */
                document.body.style.userSelect = "none";

                /** Initializes the drag event */
                const initialMouseCoordinates = { x: event.clientX, y: event.clientY };
                const initialPopoverCoordinates = popoverState.position;

                /** Add the mouse move and mouse up to the document */
                const handleMouseMove = (event: MouseEvent) => {
                    const offsetCoordinates = {
                        x: initialPopoverCoordinates.x + event.clientX - initialMouseCoordinates.x,
                        y: initialPopoverCoordinates.y + event.clientY - initialMouseCoordinates.y,
                    };

                    popoverPosition.current = offsetCoordinates;
                    setPopoverState(
                        (prevState) =>
                            produce(prevState, (draft) => {
                                draft.position = offsetCoordinates;
                            }),
                        () => {}
                    );

                    if (config.isConnected) drawPopoverConnection();
                };
                const handleMouseUp = () => {
                    setPopoverDragHandleState((prevState) =>
                        produce(prevState, (draft) => {
                            draft.isPressing = false;
                        })
                    );

                    document.body.style.cursor = "unset";
                    document.body.style.userSelect = "unset";

                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
            }
        };

        return (
            <>
                {props.isActive && (
                    <>
                        <div className={scss["popover__wrapper"]}>
                            <div
                                className={popupClassName}
                                style={{
                                    visibility: popoverState.isVisible ? "visible" : "hidden",
                                    transform: `translate3d(${popoverState.position.x}px, ${popoverState.position.y}px, 0px)`,
                                }}
                                ref={mergeRefs([popover, ref])}
                            >
                                <div className={scss["popover__content"]}>{props.content}</div>
                                <PassRelativeMouseCoordinates>
                                    <div
                                        className={scss["popover__drag-handle"]}
                                        onMouseEnter={handleDragHandleMouseEnter}
                                        onMouseLeave={handleDragHandleMouseLeave}
                                        onMouseDown={handleDragHandleMouseDown}
                                    >
                                        <div className={scss["popover__drag-handle__background"]} />
                                        <Flap
                                            className={scss["popover__drag-handle__flap"]}
                                            classNameObject={
                                                scss["popover__drag-handle__flap-object"]
                                            }
                                            isActive={popoverDragHandleState.isHovering}
                                        />
                                        <Flap
                                            className={scss["popover__drag-handle__drop"]}
                                            classNameObject={
                                                scss["popover__drag-handle__drop__object"]
                                            }
                                            isActive={popoverDragHandleState.isPressing}
                                        />
                                    </div>
                                </PassRelativeMouseCoordinates>
                            </div>
                        </div>
                        {config.isConnected && (
                            <div className={scss["popover__connection"]}>
                                <div
                                    className={scss["popover__connection__canvas"]}
                                    ref={popoverConnectionCanvas}
                                />
                            </div>
                        )}
                    </>
                )}
                {createChildMutator(props.children).appendRef(child).mutate()}
            </>
        );
    });

Popover.displayName = "Popup";
export default Popover;
