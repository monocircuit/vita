/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import Flap from "../flap/flap";
import FlapContainer from "../flap/flapContainer";
import Tooltip from "@/utils/ui/tooltip/tooltip";

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

    /**
     * Turns the animation for hovering off
     */
    onlyPressAnimation?: boolean;

    /**
     * Turns the animation for pressing off
     */
    onlyHoverAnimation?: boolean;

    /**
     * Sets a function that will be executed when the button is pressed
     */
    onPress?: () => void;

    /**
     * Sets icon height
     */
    iconSize?: number;

    classNames?: string;
}

const Button: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR: References */
    const button = useRef<HTMLDivElement>(null);
    const buttonUnwrappedSvg = useRef<HTMLDivElement>(null);
    const buttonUnwrappedTxt = useRef<HTMLDivElement>(null);

    /** ANCHOR: State */
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [isPressing, setIsPressing] = useState<boolean>(false);

    const [isWrapped, setIsWrapped] = useState<boolean>(false);

    /** ANCHOR: Callbacks */
    const updateWrapState = useCallback(() => {
        if (!buttonUnwrappedSvg.current || !buttonUnwrappedTxt.current) return;
        const buttonUnwrappedSvgRect = buttonUnwrappedSvg.current.getBoundingClientRect();
        const buttonUnwrappedTxtRect = buttonUnwrappedTxt.current.getBoundingClientRect();

        setIsWrapped(
            buttonUnwrappedSvgRect.y + buttonUnwrappedSvgRect.height <= buttonUnwrappedTxtRect.y
        );
    }, []);

    /** ANCHOR: Effects */
    /**
     * This effect ensures that any rasterized images (e.g., <img> elements)
     * within the button component have their height explicitly set if
     * the `iconSize` prop is provided. It scans for all <img> elements
     * within the `button` reference, and for each image, sets the `height`
     * property to the value of `iconSize`. This is useful for maintaining
     * consistent icon sizing when rasterized images are used as icons.
     */
    useEffect(() => {
        if (!props.iconSize || !button.current) return;
        const imgs = button.current.querySelectorAll("img");
        imgs.forEach((img) => {
            if (!props.iconSize) return;
            img.style.height = `${props.iconSize}px`;
            img.style.width = `${props.iconSize}px`;
        });
    });

    /**
     * This effect observes the size of the `button` component using a `ResizeObserver`.
     * If the button becomes too small, it triggers the `updateWrapState` function,
     * which removes the button's text and ensures only the icon is displayed.
     * This is useful for maintaining usability and a clean design when space is limited.
     * The `ResizeObserver` is disconnected during cleanup to avoid memory leaks.
     */
    useEffect(() => {
        if (!button.current) return;
        updateWrapState();
        const resizeObserver = new ResizeObserver(updateWrapState);
        resizeObserver.observe(button.current);

        /** Clean Up */
        return () => resizeObserver.disconnect();
    }, [updateWrapState]);

    /** ANCHOR: Handlers */
    const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsHovering(true);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsHovering(false);
        setIsPressing(false);
    };

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsPressing(true);
        if (props.onPress) props.onPress();
    };

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsPressing(false);
    };

    return (
        <div className={props.classNames}>
            <PassRelativeMouseCoordinates>
                <Tooltip isActive={isHovering} isHidden={!isWrapped} text={props.text}>
                    <div
                        className={[scss["button"], scss[`button__${props.type}`]].join(" ")}
                        ref={button}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    >
                        <div className={scss["button__background"]}>
                            <FlapContainer>
                                {props.onlyPressAnimation ? (
                                    <></>
                                ) : (
                                    <Flap isHovering={isHovering} color="#FFD100" />
                                )}
                                {props.onlyHoverAnimation ? (
                                    <></>
                                ) : (
                                    <Flap isPressing={isPressing} color="#FFD100" />
                                )}
                            </FlapContainer>
                        </div>
                        <div className={scss["button__foreground"]}>
                            {/**
                             * WRAPPED CONSTELLATION!
                             */}
                            <div
                                className={scss["button__foreground__wrapped"]}
                                style={{ visibility: isWrapped ? "visible" : "hidden" }}
                            >
                                {props.children}
                            </div>
                            {/**
                             * UNWRAPPED CONSTELLATION!
                             */}
                            <div
                                className={scss["button__foreground__notwrapped"]}
                                style={{ visibility: isWrapped ? "hidden" : "visible" }}
                            >
                                <div
                                    className={scss["button__foreground__svg"]}
                                    ref={buttonUnwrappedSvg}
                                >
                                    {props.children}
                                </div>
                                <div
                                    className={scss["button__foreground__text"]}
                                    style={{
                                        textTransform: props.capslock ? "uppercase" : "unset",
                                    }}
                                    ref={buttonUnwrappedTxt}
                                >
                                    {props.text}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tooltip>
            </PassRelativeMouseCoordinates>
        </div>
    );
};

export default Button;
