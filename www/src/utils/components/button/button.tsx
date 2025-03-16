"use client";

import React, { ReactNode, useRef, useState } from "react";
import { produce } from "immer";

import Flap from "../flap/flap";
import FlapContainer from "../flap/flapContainer";

import scss from "./button.module.scss";
import PassRelativeMouseCoordinates from "../passMouseCoordinates/passMouseCoordinates";

export interface Props {
    /**
     * Defines the text displayed on the button.
     */
    text?: string;

    /**
     * Specifies the font size of the button text, in pixels.
     */
    fontSize?: number;

    /**
     * Sets the width of the button.
     * Accepts values in pixels or percentages (e.g., "100px" or "50%").
     */
    width?: `${number}px` | `${number}%`;

    /**
     * Sets the height of the button.
     * Accepts values in pixels or percentages (e.g., "50px" or "20%").
     */
    height?: `${number}px` | `${number}%`;

    /**
     * Determines the visual style of the button.
     * - "primary": Highlights the button as the main action.
     * - "secondary": Indicates a less prominent action.
     */
    type?: "primary" | "secondary";

    /**
     * If set to true, the button text will be displayed in uppercase letters.
     */
    capslock?: boolean;

    /**
     * Accepts a child component, such as a Next.js Image or an inline SVG element.
     */
    children?: ReactNode;
}

const Button: React.FunctionComponent<Props> = (props) => {
    /** State */
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [isPressing, setIsPressing] = useState<boolean>(false);

    /** Handlers */
    const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsHovering(true);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsHovering(false);
        setIsPressing(false);
    };

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsPressing(true);
    };

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsPressing(false);
    };

    return (
        <PassRelativeMouseCoordinates>
            <div
                className={[scss["button"], scss[`button__${props.type}`]].join(" ")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <div className={scss["button__background"]}>
                    <FlapContainer>
                        <Flap isHovering={isHovering} color="#FFD100" />
                        <Flap isPressing={isPressing} color="#FFD100" />
                    </FlapContainer>
                </div>
                <div className={scss["button__foreground"]}>
                    {props.children}
                    <div
                        className={scss["button__foreground__text"]}
                        style={{ textTransform: props.capslock ? "uppercase" : "unset" }}
                    >
                        {props.text}
                    </div>
                </div>
            </div>
        </PassRelativeMouseCoordinates>
    );
};

export default Button;
