"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

import scss from "@/utils/ui/modal/modal.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import { produce } from "immer";

interface Props {
    /**
     * The content of the popup
     */
    children: React.ReactNode;
    /**
     * className to style
     */
    className: string;
}

const Modal: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>> =
    forwardRef((props, ref?) => {
        /** ANCHOR: References */
        const modal = useRef<HTMLDivElement>(null);

        /** ANCHOR: ClassName */
        const modalClassName = useClassName(scss["modal"], props.className);

        return (
            <div
                className={modalClassName}
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

                    modal.current = element;
                }}
            >
                {props.children}
            </div>
        );
    });

Modal.displayName = "Modal";
export default Modal;
