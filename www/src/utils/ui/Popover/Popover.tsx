import React, { forwardRef, useEffect, useRef, useState } from "react";
import styles from "./Popover.module.scss";
import { mergeRefs } from "react-merge-refs";
import { DndContext, Modifier } from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/utilities";
import PopoverDraggable from "./PopoverDraggable";
import useDraggableDelta from "@/utils/hooks/useDraggableDelta";
import createChildMutator from "@/utils/react/createChildMutator";
import useElementConnection from "@/utils/ui/ElementConnection/useElementConnection";

export type PopoverProps = {
    /**
     * The element to which the popover will be anchored.
     * This is typically a React element that triggers or interacts with the popover.
     */
    children: React.ReactElement<any, any>;

    /**
     * The content to be displayed inside the popover.
     * Can be any valid React node, such as text, components, or elements.
     */
    content: React.ReactNode;

    /**
     * A flag indicating whether the popover should be rendered.
     * - `true`: The popover is rendered and displayed.
     * - `false`: The popover is not rendered.
     * Defaults to `false` if not provided.
     */
    shouldRender?: boolean;

    /**
     * An optional CSS class name to be applied to the popover's outer `<div>` element.
     * Allows for custom styling of the popover via external styles or CSS frameworks.
     */
    className?: string;

    /**
     * Configuration options to customize the popover's appearance and behavior.
     */
    config?: {
        /**
         * Specifies the direction in which the popover should be positioned relative to the anchor element.
         * - `"left"`: popover appears to the left of the anchor.
         * - `"right"`: popover appears to the right of the anchor.
         * - `"top"`: popover appears above the anchor.
         * - `"bottom"`: popover appears below the anchor.
         */
        pushTo?: "left" | "right" | "top" | "bottom";

        pushDistance?: number;

        /**
         * Indicates whether the popover is visually or contextually connected to its anchor element.
         * - `true`: The popover maintains a visual connection (e.g., with an arrow or close placement).
         * - `false`: The popover may appear detached.
         * Defaults to `false` if not provided.
         */
        isConnected?: boolean;

        /**
         * Determines if the popover can be dragged by the user.
         * - `true`: popover is draggable.
         * - `false`: popover remains fixed at its position.
         * Defaults to `false` if not provided.
         */
        isDraggable?: boolean;
    };
};

const Popover = forwardRef(
    (
        { children: anchorElement, config = {}, ...props }: PopoverProps,
        forwardRef: React.ForwardedRef<HTMLDivElement>
    ) => {
        /** ANCHOR: Contants */
        const PUSH_DISTANCE = config.pushDistance ?? 5;

        /** ANCHOR: References */
        const popover = useRef<HTMLDivElement>(null);
        const anchorElementRef = useRef<HTMLDivElement>(null);

        /** ANCHOR: DraggableDelta */
        const { handleDragEnd, draggableDelta } = useDraggableDelta();

        /** ANCHOR: ElementConnection */
        const elementConnection = useElementConnection(anchorElementRef, popover);

        /** ANCHOR: State */
        const [pushTo, setPushTo] = useState<Coordinates>();

        /** ANCHOR: Effects */
        useEffect(() => {
            if (!popover.current) return;
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

            setPushTo(popoverCoordinates);
        }, [PUSH_DISTANCE, config.pushTo, props.shouldRender]);

        useEffect(() => {
            if (props.shouldRender) elementConnection.drawElementConnection();
        }, [props.shouldRender, elementConnection]);

        /** ANCHOR: Handlers */
        const handleDragMove = () => {
            elementConnection.drawElementConnection();
        };

        return (
            <>
                {props.shouldRender && (
                    <>
                        <div className={styles["popover__wrapper"]}>
                            <DndContext onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
                                <PopoverDraggable
                                    className={props.className}
                                    ref={mergeRefs([forwardRef, popover])}
                                    draggableDelta={{
                                        x: (draggableDelta?.x ?? 0) + (pushTo?.x ?? 0),
                                        y: (draggableDelta?.y ?? 0) + (pushTo?.y ?? 0),
                                    }}
                                    isVisible={!!pushTo}
                                >
                                    {props.content}
                                </PopoverDraggable>
                            </DndContext>
                        </div>
                        {elementConnection.connection}
                    </>
                )}
                {createChildMutator(anchorElement).appendRef(anchorElementRef).mutate()}
            </>
        );
    }
);

Popover.displayName = "Popover";
export default Popover;
