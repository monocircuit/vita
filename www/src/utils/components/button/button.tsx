"use client";

import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Flap from "../flap/flap";
import FlapContainer from "../flap/flapContainer";
import Tooltip from "@/utils/components/tooltip/tooltip";

import scss from "./button.module.scss";
import PassRelativeMouseCoordinates from "../passMouseCoordinates/passMouseCoordinates";
import { produce } from "immer";

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

    /**
     * Turns the animation for hovering off
     */
    onlyPressAnimation?: boolean;

    /**
     * Turns the animation for pressing off
     */
    onlyHoverAnimation?: boolean;

    /**
     * Redirects to the given url
     */
    linkTo?: string;
}

interface WrappingState {
    isWrapped: boolean;
    wrappedStyle: React.CSSProperties;
    notWrappedStyle: React.CSSProperties;
}

const Button: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR: References */
    const button = useRef<HTMLDivElement>(null);

    /** ANCHOR: Router */
    const router = useRouter();

    /** ANCHOR: State */
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [isPressing, setIsPressing] = useState<boolean>(false);

    const [wrappingState, setWrappingState] = useState<WrappingState>({
        /** Initial State */
        isWrapped: false,
        notWrappedStyle: {
            visibility: "visible",
        },
        wrappedStyle: {
            visibility: "hidden",
        },
    });

    /** ANCHOR: Callbacks */
    const updateWrapState = useCallback(() => {
        if (!button.current) return;
        if (button.current.scrollHeight > button.current.clientHeight) {
            /** isWrapped = true*/
            setWrappingState((prevState) =>
                produce(prevState, (draft) => {
                    draft.isWrapped = true;
                    draft.wrappedStyle.visibility = "visible";
                    draft.notWrappedStyle.visibility = "hidden";
                })
            );
        } else {
            /** isWrapped = false */
            setWrappingState((prevState) =>
                produce(prevState, (draft) => {
                    draft.isWrapped = false;
                    draft.wrappedStyle.visibility = "hidden";
                    draft.notWrappedStyle.visibility = "visible";
                })
            );
        }
    }, []);

    /** ANCHOR: Effects */
    useEffect(() => {
        if (!button.current) return;
        updateWrapState();
        const resizeObserver = new ResizeObserver(() => updateWrapState());
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

        /** Redirecting if link is given */
        if (props.linkTo) {
            router.push(props.linkTo);
        }
    };

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
        setIsPressing(false);
    };

    return (
        <PassRelativeMouseCoordinates>
            <Tooltip isActive={isHovering} isHidden={!wrappingState.isWrapped} text={props.text}>
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
                        <div
                            className={scss["button__foreground__wrapped"]}
                            style={wrappingState.wrappedStyle}
                        >
                            {props.children}
                        </div>
                        <div
                            className={scss["button__foreground__notwrapped"]}
                            style={wrappingState.notWrappedStyle}
                        >
                            {props.children}
                            <div
                                className={scss["button__foreground__text"]}
                                style={{ textTransform: props.capslock ? "uppercase" : "unset" }}
                            >
                                {props.text}
                            </div>
                        </div>
                    </div>
                </div>
            </Tooltip>
        </PassRelativeMouseCoordinates>
    );
};

export default Button;
