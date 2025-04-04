import React, { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import styles from "./PopoverDraggable.module.scss";
import { PopoverProps } from "./Popover";
import useClassName from "@/utils/hooks/useClassName";
import { useDraggable } from "@dnd-kit/core";
import RelativeMouseCoordiantesContext from "../RelativeMouseCoordinatesContext/RelativeMouseCoordinatesContext";
import { Coordinates } from "@dnd-kit/utilities";
import Flap from "../Flap/Flap";
import { mergeRefs } from "react-merge-refs";
import { translateWithDraggableDelta } from "@/utils/hooks/useDraggableDelta";

type PopoverDraggableProps = {
    children: React.ReactNode;
    draggableDelta?: Coordinates;
    className?: string;
    config?: PopoverProps["config"];
    isVisible?: boolean;
};

const PopoverDraggable = forwardRef(
    (props: PopoverDraggableProps, forwardRef?: ForwardedRef<HTMLDivElement>) => {
        /** ANCHOR: ClassNames */
        const popoverClassName = useClassName(props.className, styles["popover-draggable"]);

        /** ANCHOR: Draggables */
        const popoverDraggable = useDraggable({ id: "popover-draggable" });

        /** ANCHOR: State */
        const [isHovering, setIsHovering] = useState<boolean>(false);
        const [isPressing, setIsPressing] = useState<boolean>(false);

        /** ANCHOR: Handlers */
        const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = () => {
            setIsHovering(true);
        };

        const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = () => {
            setIsPressing(true);

            const handleMouseUp = () => {
                setIsPressing(false);
                setIsHovering(false);
                document.removeEventListener("mouseup", handleMouseUp); /** clean up */
            };

            document.addEventListener("mouseup", handleMouseUp);
        };

        return (
            <div
                className={popoverClassName}
                style={{
                    transform: translateWithDraggableDelta(
                        popoverDraggable.transform,
                        props.draggableDelta
                    ),
                    contentVisibility: props.isVisible ? "visible" : "hidden",
                }}
                ref={mergeRefs([popoverDraggable.setNodeRef, forwardRef])}
            >
                <RelativeMouseCoordiantesContext>
                    <div
                        className={styles["popover-draggable__drag-handle"]}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        {...popoverDraggable.listeners}
                        {...popoverDraggable.attributes}
                    >
                        <div className={styles["popover-draggable__drag-handle__background"]} />
                        <Flap
                            className={styles["popover-draggable__drag-handle__flap"]}
                            classNameObject={styles["popover__drag-handle__flap-object"]}
                            isActive={isHovering}
                        />
                        <Flap
                            className={styles["popover-draggable__drag-handle__drop"]}
                            classNameObject={styles["popover-draggable__drag-handle__drop__object"]}
                            isActive={isPressing}
                        />
                    </div>
                </RelativeMouseCoordiantesContext>
                <div className={styles["popover-draggable__content"]}>{props.children}</div>
            </div>
        );
    }
);

PopoverDraggable.displayName = "PopoverDraggable";
export default PopoverDraggable;
