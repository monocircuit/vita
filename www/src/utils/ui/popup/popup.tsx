"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

import scss from "@/utils/ui/popup/popup.module.scss";
import { Coordinates } from "@/utils/types/types";
import useClassName from "@/utils/hooks/useClassName";
import { produce } from "immer";

interface Props {
    /**
     * Coordinates relative to a certain Element
     */
    position: Coordinates;
    /**
     * The content of the popup
     */
    children: React.ReactNode;
    /**
     * className to style
     */
    className: string;
}

const Popup: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>> =
    forwardRef((props, ref?) => {
        /** ANCHOR: References */
        const popup = useRef<HTMLDivElement>(null);

        /** ANCHOR: ClassName */
        const popupClassName = useClassName(scss["popup"], props.className);

        /** ANCHOR: State */
        const [popupState, setPopupState] = useState<React.CSSProperties>({
            /** Initial State */
            transform: `translate3d(${props.position.x}px, ${props.position.y}px, 0px)`,
        });

        useEffect(() => {
            if (popup.current) {
            }

            setPopupState((prevState) =>
                produce(prevState, (draft) => {
                    draft.transform = `translate3d(${props.position.x}px, ${props.position.y}px, 0px)`;
                })
            );
        }, [props.position]);

        return (
            <div
                className={popupClassName}
                style={popupState}
                ref={(element) => {
                    if (!element) return;
                    if (ref) {
                        switch (typeof ref) {
                            case "object":
                                ref.current = element;
                                break;
                            case "function":
                                ref(element);
                        }
                    }

                    popup.current = element;
                }}
            >
                {props.children}
            </div>
        );
    });

Popup.displayName = "Popup";
export default Popup;
