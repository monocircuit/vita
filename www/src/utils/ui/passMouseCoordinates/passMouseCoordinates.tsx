/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Coordinates } from "@/utils/types/types";

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

    /** ANCHOR: Callbacks */
    const getChildProps = useCallback(
        (child: any) => ({
            onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                if (child && child.props && child.props.onMouseEnter)
                    child.props.onMouseEnter(event);
                handleMouseEvent(event);
            },
            onMouseMove: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                if (child && child.props && child.props.onMouseMove) child.props.onMouseMove(event);
                handleMouseEvent(event);
            },
            onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                if (child && child.props && child.props.onMouseLeave)
                    child.props.onMouseLeave(event);
                handleMouseEvent(event);
            },
            ref: (element: HTMLDivElement | null) => {
                if (child && child.props && child.props.ref) child.props.ref.current = element;
                ref.current = element;
            },
        }),
        []
    );

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
                /** Bypass when Tooltip is wrapping UI Element */
                if (child && child.type && child.type.name == "Tooltip") {
                    return React.cloneElement(child as any, {
                        children: React.cloneElement(
                            child.props.children,
                            getChildProps(child.props.children)
                        ),
                    });
                }

                return React.cloneElement(child as any, getChildProps(child));
            })}
        </RelativeMouseCoordinates.Provider>
    );
};

export default PassRelativeMouseCoordinates;
