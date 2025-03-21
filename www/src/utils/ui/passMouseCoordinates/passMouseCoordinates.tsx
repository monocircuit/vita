"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Coordinates } from "@/utils/types/types";
import ReactChildMutator from "@/utils/react/ReactChildMutator";
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

    useEffect(() => {
        console.log("coords", ref.current);
    }, []);

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
