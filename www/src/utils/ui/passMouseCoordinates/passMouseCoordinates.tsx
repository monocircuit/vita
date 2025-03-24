"use client";

import React, { useRef, useState } from "react";

import { Coordinates } from "@/utils/types/types";
import createChildMutator from "@/utils/react/createChildMutator";

export interface Props {
    children?: React.ReactElement<any, any>;
}

export const RelativeMouseCoordinates = React.createContext({ x: 0, y: 0 });

const PassRelativeMouseCoordinates: React.FunctionComponent<Props> = ({ children }) => {
    /** ANCHOR: References */
    const ref = useRef<HTMLDivElement>(null);

    /** ANCHOR: State */
    const [relativeMouseCoordinates, setRelativeMouseCoordinates] = useState<Coordinates>({
        x: 0,
        y: 0,
    });

    /** ANCHOR: Handlers */
    const handleMouseEvent: React.MouseEventHandler<HTMLElement> = (event) => {
        if (!ref.current) return;

        const boundingClientRect = ref.current.getBoundingClientRect();
        setRelativeMouseCoordinates({
            x: event.clientX - boundingClientRect.left,
            y: event.clientY - boundingClientRect.top,
        });
    };

    return (
        <RelativeMouseCoordinates.Provider value={relativeMouseCoordinates}>
            {React.Children.map(children, (child) => {
                if (!child) return;

                /** Bypass when Tooltip is wrapping UI Element */
                if (child && child.type && child.type.name == "Tooltip") {
                    const element = React.cloneElement(child as any, {
                        children: createChildMutator(child.props.children)
                            .appendRef(ref)
                            .appendHandler("onMouseEnter", handleMouseEvent)
                            .appendHandler("onMouseMove", handleMouseEvent)
                            .appendHandler("onMouseLeave", handleMouseEvent)
                            .mutate(),
                    });

                    return element;
                }

                return createChildMutator(child)
                    .appendRef(ref)
                    .appendHandler("onMouseEnter", handleMouseEvent)
                    .appendHandler("onMouseMove", handleMouseEvent)
                    .appendHandler("onMouseLeave", handleMouseEvent)
                    .mutate();
            })}
        </RelativeMouseCoordinates.Provider>
    );
};

export default PassRelativeMouseCoordinates;
