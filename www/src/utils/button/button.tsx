"use client";

import React, {
    FunctionComponent,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import getRelativeMouseCoordinates from "../functions/getRelativeMouseCoordinates";
import styles from "./button.module.scss";
import { produce } from "immer";
import { Coordinates } from "../types";

// SECTION: Interfaces
interface Props {
    text?: string;
    filling?: boolean;
    icon?: ReactNode;
}

interface ButtonBackgroundState {
    style: React.CSSProperties;
}

// SECTION: Function Component
const Button: FunctionComponent<Props> = (props) => {
    // SECTION - Contants
    const HEIGHT_TRANSITION_TIME = 0.1;

    // SECTION - References
    const button = useRef<HTMLDivElement>(null);
    const buttonBackground = useRef<HTMLDivElement>(null);

    // SECTION - State
    const [getMouseCoordinates, setMouseCoordinates] = useState<Coordinates>();
    const [getButtonBackgroundState, setButtonBackgroundState] = useState<ButtonBackgroundState>({
        /** Initial State */
        style: { visibility: "hidden", transition: `height ${HEIGHT_TRANSITION_TIME}s ease` },
    });

    // SECTION - Callback Hooks
    const translateButtonBackground = useCallback(() => {
        if (button && button.current && buttonBackground.current && getMouseCoordinates) {
            /** Setting up needed Information */
            const buttonBackgroundCircumference = buttonBackground.current.clientHeight;
            const relativeMouseCoordinates = getRelativeMouseCoordinates(
                getMouseCoordinates,
                button.current.getBoundingClientRect()
            );

            /** Calculations */
            const buttonBackgroundTranslation = {
                x: relativeMouseCoordinates.x - buttonBackgroundCircumference / 2,
                y: relativeMouseCoordinates.y - buttonBackgroundCircumference / 2,
            };

            /** State */
            setButtonBackgroundState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.transform = `translate3d(${buttonBackgroundTranslation.x}px, ${buttonBackgroundTranslation.y}px, 0px)`;
                })
            );
        }
    }, [getMouseCoordinates]);

    // SECTION - Effect Hooks
    useEffect(() => {
        if (!buttonBackground.current) return;
        const resizeObserver = new ResizeObserver(() => {
            /** Gets triggered when the size of buttonBackground changes */
            /** Translate Button Background such that it is always centered with mouse */
            translateButtonBackground();
        });
        resizeObserver.observe(buttonBackground.current);

        /** Clean Up */
        return () => resizeObserver.disconnect();
    }, [getMouseCoordinates, translateButtonBackground]);

    // SECTION - Handlers
    const handleButtonMouseEnter: React.MouseEventHandler<HTMLDivElement> = (event) => {
        /** Update Mouse Coordinates */
        setMouseCoordinates({ x: event.clientX, y: event.clientY });
        /** Move ButtonBackground */
        translateButtonBackground();
        /** Make ButtonBackground visible */
        setTimeout(() => {
            setButtonBackgroundState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.visibility = "visible";
                })
            );
        }, 10);
    };

    const handleButtonMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        setButtonBackgroundState((prevState) =>
            produce(prevState, (draft) => {
                draft.style.visibility = "hidden";
            })
        );
    };

    const handleButtonMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
        /** Update Mouse Information */
        setMouseCoordinates({ x: event.clientX, y: event.clientY });
        /** Move ButtonBackground */
        translateButtonBackground();
    };

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = () => {
        if (button.current && buttonBackground.current) {
            /** calculating circumference such that ButtonBackground fully fills the button */
            const circumference =
                (button.current.clientHeight > button.current.clientWidth
                    ? button.current.clientHeight
                    : button.current.clientWidth) * 3;

            /** State */
            setButtonBackgroundState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.height = `${circumference}px`;
                    draft.style.transition = "height 0.3s ease";
                })
            );
        }
    };

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
        setButtonBackgroundState((prevState) =>
            produce(prevState, (draft) => {
                draft.style.height = "100%";
            })
        );
    };

    return (
        <div
            className={styles["button"]}
            ref={button}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            onMouseMove={handleButtonMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            // onClick={handleMouseOnClick}
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
