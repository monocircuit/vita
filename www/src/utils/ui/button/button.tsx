"use client";

import React, { forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import Flap from "../Flap/Flap";
import FlapContainer from "../Flap/FlapContainer";
import Tooltip from "@/utils/ui/Tooltip/Tooltip";

import scss from "./Button.module.scss";
import PassRelativeMouseCoordinates from "../PassMouseCoordinates/PassMouseCoordinates";
import useClassName from "@/utils/hooks/useClassName";
import Drop from "../Drop/Drop";

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
    type?: "primary" | "secondary" | "tertiary";

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
    onlyClickAnimation?: boolean;

    /**
     * Turns the animation for pressing off
     */
    onlyHoverAnimation?: boolean;

    /**
     * Sets a function that will be executed when the button is pressed
     */
    onClick?: (props: Props) => void;

    /**
     * Sets icon height
     */
    iconSize?: number;

    /**
     * Sets Type for Form / for example: "submit"
     */
    formType?: string;

    /**
     * classNames that will be attached to the wrapping div of the button
     */
    className?: string;

    /**
     * className for Drop
     */
    classNameDrop?: string;

    /**
     * className for Flap
     */
    classNameFlap?: string;

    /**
     * vibrates onClick when vibration is available.
     */
    vibrate?: boolean;

    /**
     * Tells the button to if it should show a Tooltip in case there is no
     * icon.
     */
    tooltip?: boolean;
}

const Button: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>> =
    forwardRef((props, ref?) => {
        /** ANCHOR: References */
        const button = useRef<HTMLDivElement>(null);
        const buttonUnwrappedSvg = useRef<HTMLDivElement>(null);
        const buttonUnwrappedTxt = useRef<HTMLDivElement>(null);

        /** ANCHOR: State */
        const [isHovering, setIsHovering] = useState<boolean>(false);
        const [isPressing, setIsPressing] = useState<boolean>(false);

        const [isWrapped, setIsWrapped] = useState<boolean>(false);

        /** ANCHOR: ClassNames */
        const buttonClassName = useClassName(scss["button"], scss[`button__${props.type}`]);
        const buttonWrapperClassName = useClassName(props.className);
        const buttonBackgroundDropClassName = useClassName(
            scss["button__background__drop"],
            props.classNameDrop
        );
        const buttonBackgroundFlapClassName = useClassName(
            scss["button__background__flap"],
            props.classNameFlap
        );

        /** ANCHOR: Callbacks */
        const submitForm = useCallback(() => {
            /** find closest Form and submit on click */
            if (props.formType === "submit" && button.current) {
                const form = button.current.closest("form"); /** find closest form */
                if (form) form.requestSubmit(); /** safely submit the form */
            }
        }, [props.formType]);

        const vibrate = useCallback(() => {
            /** vibrate if vibration is available */
            if (typeof navigator.vibrate === "function") {
                navigator.vibrate(100);
            }
        }, []);

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

        const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
            setIsPressing(false);
        };

        const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
            setIsPressing(true);
            vibrate();
            submitForm();
            if (props.onClick) props.onClick(props);
        };

        return (
            <div className={buttonWrapperClassName} {...(ref && { ref })}>
                <PassRelativeMouseCoordinates>
                    <Tooltip
                        isActive={props.tooltip ? isHovering : false}
                        isHidden={!isWrapped}
                        text={props.text}
                    >
                        <div
                            className={buttonClassName}
                            ref={button}
                            onClick={handleClick}
                            onMouseUp={handleMouseUp}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className={scss["button__background"]}>
                                <FlapContainer>
                                    {props.onlyClickAnimation ? (
                                        <></>
                                    ) : (
                                        <Flap
                                            classNameObject={buttonBackgroundFlapClassName}
                                            isActive={isHovering}
                                        />
                                    )}
                                    {props.onlyHoverAnimation ? (
                                        <></>
                                    ) : (
                                        <Drop
                                            classNameObject={buttonBackgroundDropClassName}
                                            isActive={isPressing}
                                        ></Drop>
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
    });

Button.displayName = "Button";
export default Button;
