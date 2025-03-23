"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import scss from "./ElementMessage.module.scss";
import Popup from "../popup/popup";
import createChildMutator from "@/utils/react/createChildMutator";
import { Coordinates } from "@/utils/types/types";
import { produce } from "immer";

type Props = {
    message: string;
    children: any;
    inner?: boolean;
    outer?: boolean;
    warn?: boolean;
    isActive?: boolean;
};

type PopupContentStyle = {
    wrapper: React.CSSProperties;
    background: React.CSSProperties;
    foreground: React.CSSProperties;
};

const ElementMessage: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR: References */
    const child = useRef<HTMLDivElement>(null);
    const popupContent = useRef<HTMLDivElement>(null);

    /** ANCHOR: State */
    const [popupPosition, setPopupPosition] = useState<Coordinates>({ x: 0, y: 0 });
    const [popupContentStyle, setPopupContentStyle] = useState<PopupContentStyle>({
        /** Initial State */
        wrapper: {},
        background: {},
        foreground: {},
    });

    /** ANCHOR: Callbacks */
    const translatePopup = useCallback(() => {
        if (!child.current || !popupContent.current) return;
        const popupContentRect = popupContent.current.getBoundingClientRect();

        setPopupPosition((prevState) =>
            produce(prevState, (draft) => {
                draft.x = -popupContentRect.width;
                draft.y = 0;
            })
        );
    }, []);

    /** ANCHOR: Effects */
    useEffect(() => {
        if (props.warn) {
            setPopupContentStyle((prevState) =>
                produce(prevState, (draft) => {
                    draft.wrapper.border = "var(--stroke) solid var(--warning-color)";
                    draft.background.backgroundColor = "var(--warning-color)";
                    draft.background.filter = "opacity(20%)";
                })
            );
        }
    }, [props.warn]);

    useEffect(() => {
        if (props.isActive) {
            translatePopup();
        }
    }, [props.isActive, translatePopup]);

    return (
        <>
            {props.isActive ? (
                <div className={scss["element-message__wrapper"]}>
                    <Popup
                        className={scss["element-message__wrapper__popup"]}
                        position={popupPosition}
                    >
                        <div
                            className={scss["element-message__wrapper__popup__content"]}
                            style={popupContentStyle.wrapper}
                            ref={popupContent}
                        >
                            <div
                                className={
                                    scss["element-message__wrapper__popup__content__background"]
                                }
                                style={popupContentStyle.background}
                            ></div>
                            <div
                                className={
                                    scss["element-message__wrapper__popup__content__foreground"]
                                }
                                style={popupContentStyle.foreground}
                            >
                                {props.message}
                            </div>
                        </div>
                    </Popup>
                    <div className={scss["element-message__wrappper__children"]}>
                        {createChildMutator(props.children).appendRef(child).mutate()}
                    </div>
                </div>
            ) : (
                <>{props.children}</>
            )}
        </>
    );
};

export default ElementMessage;
