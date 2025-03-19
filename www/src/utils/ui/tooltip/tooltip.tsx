/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import scss from "./tooltip.module.scss";
import { produce } from "immer";

export interface Props {
    isActive: boolean;
    isHidden?: boolean;
    speed?: number;
    text?: string;
    children?: React.ReactElement<any, any>[] | React.ReactElement<any, any>;
}

interface TooltipState {
    style: React.CSSProperties;
}

const Tooltip: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR */
    const TOOLTIP_SPEED = props.speed ? props.speed : 1000;

    /** ANCHOR: References */
    const tooltip = useRef<HTMLDivElement>(null);
    const tooltipObject = useRef<HTMLElement>(null);
    const isActive = useRef<boolean>(props.isActive);
    const timeout = useRef<NodeJS.Timeout>(null);

    /** ANCHOR: State */
    const [tooltipState, setTooltipState] = useState<TooltipState>({
        /** Initial State */
        style: { visibility: "hidden" },
    });

    /** ANCHOR: Callbacks */
    const showTooltip = useCallback(() => {
        if (!isActive.current) return;
        setTooltipState((prevState) =>
            produce(prevState, (draft) => {
                draft.style.visibility = "visible";
            })
        );
    }, []);

    const hideToolTip = useCallback(() => {
        setTooltipState((prevState) =>
            produce(prevState, (draft) => {
                draft.style.visibility = "hidden";
            })
        );
    }, []);

    const translateTooltip = useCallback(() => {
        if (!tooltip.current || !tooltipObject.current) return;

        const newCoordinates = {
            x: (tooltipObject.current.clientWidth - tooltip.current.clientWidth) / 2,
            y: tooltipObject.current.clientHeight + 2,
        };

        setTooltipState((prevState) =>
            produce(prevState, (draft) => {
                draft.style.transform = `translate3d(${newCoordinates.x}px, ${newCoordinates.y}px, 0px)`;
            })
        );
    }, []);

    /** ANCHOR: Effects */
    useEffect(() => {
        isActive.current = props.isActive;

        /** resetting timeout such that the Tooltip adheres to the TOOLTIP_SPEED */
        if (timeout.current) clearTimeout(timeout.current);

        /** activating the Tooltip */
        if (isActive.current) {
            /** translating the Tooltip to the designated position */
            translateTooltip();
            /** initializing the timeout such that the tooltip is showing after TOOLTIP_SPEED */
            timeout.current = setTimeout(showTooltip, TOOLTIP_SPEED);
            return;
        }

        /** deactivating the Tooltip */
        hideToolTip();
    }, [TOOLTIP_SPEED, showTooltip, hideToolTip, props.isActive, translateTooltip]);

    return (
        <>
            {props.isHidden ? (
                <></>
            ) : (
                <div className={scss["tooltip"]} style={tooltipState.style} ref={tooltip}>
                    {props.text}
                </div>
            )}
            {React.Children.map(props.children, (child) => {
                if (!child) return;

                return React.cloneElement(child as any, {
                    ref: (element: any) => {
                        if (!child || !child.props) return;
                        if (typeof child.props.ref === "function") {
                            child.props.ref(element);
                        } else {
                            child.props.ref.current = element;
                        }
                        tooltipObject.current = element;
                    },
                });
            })}
        </>
    );
};

export default Tooltip;
