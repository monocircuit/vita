"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";

import { Coordinates } from "@/utils/types/types";

export interface Props {
    children?: React.ReactElement<any, any>;
}

export const RelativeMouseCoordinates = React.createContext({ x: 0, y: 0 });

const PassRelativeMouseCoordinates: React.FunctionComponent<Props> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [relativeMouseCoordinates, setRelativeMouseCoordinates] = useState<Coordinates>({
        x: 0,
        y: 0,
    });

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
            {React.Children.map(children, (child) =>
                React.cloneElement(child as any, {
                    onMouseEnter: (event) => {
                        if (child && child.props && child.props.onMouseEnter)
                            child.props.onMouseEnter(event);
                        handleMouseEvent(event);
                    },
                    onMouseMove: (event) => {
                        if (child && child.props && child.props.onMouseMove)
                            child.props.onMouseMove(event);
                        handleMouseEvent(event);
                    },
                    onMouseLeave: (event) => {
                        if (child && child.props && child.props.onMouseLeave)
                            child.props.onMouseLeave(event);
                        handleMouseEvent(event);
                    },
                    ref,
                })
            )}
        </RelativeMouseCoordinates.Provider>
    );
};

export default PassRelativeMouseCoordinates;
