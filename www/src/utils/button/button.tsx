"use client";

import React, { FunctionComponent, ReactNode, useRef, useState } from "react";
import styles from "./button.module.scss";
import getMouseCoordinates from "../functions/getMouseCoordinates";

interface props {
    text?: string;
    filling?: boolean;
    icon?: ReactNode;
}

const Button: FunctionComponent<props> = (props) => {
    // SECTION - References
    const button = useRef<HTMLDivElement>(null);
    const buttonBackground = useRef<HTMLDivElement>(null);

    // SECTION - State
    const [getButtonBackgroundState, setButtonBackgroundState] = useState<{
        style: React.CSSProperties;
    }>({
        style: { visibility: "hidden" },
    });

    // SECTION - Handlers
    const handleButtonMouseEnter: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const coordinates = getMouseCoordinates(event, button);
        const circumference = buttonBackground.current?.clientHeight;

        if (coordinates && circumference) {
            setButtonBackgroundState({
                ...getButtonBackgroundState,
                style: {
                    visibility: "visible",
                    left: `${coordinates.x - circumference / 2}px`,
                    top: `${coordinates.y - circumference / 2}px`,
                },
            });
        }
    };

    const handleButtonMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
        setButtonBackgroundState({
            ...getButtonBackgroundState,
            style: { ...getButtonBackgroundState.style, visibility: "hidden" },
        });
    };

    const handleButtonMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const coordinates = getMouseCoordinates(event, button);
        const circumference = buttonBackground.current?.clientHeight;

        if (coordinates && circumference) {
            setButtonBackgroundState({
                ...getButtonBackgroundState,
                style: {
                    visibility: "visible",
                    left: `${coordinates.x - circumference / 2}px`,
                    top: `${coordinates.y - circumference / 2}px`,
                },
            });
        }
    };

    return (
        <div
            className={styles["button"]}
            ref={button}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            onMouseMove={handleButtonMouseMove}
        >
            <div className={styles["button__content"]}>
                <div className={styles["button__content__text"]}>{props.text}</div>
            </div>
            <div
                className={styles["button__background"]}
                ref={buttonBackground}
                style={getButtonBackgroundState.style}
            ></div>
        </div>
    );
};

export default Button;
