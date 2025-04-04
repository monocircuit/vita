"use client";

import React, { forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";

import scss from "./Flap.module.scss";
import { RelativeMouseCoordinates } from "../RelativeMouseCoordinatesContext/RelativeMouseCoordinatesContext";
import { produce } from "immer";
import { Coordinates } from "@/utils/types/types";
import useClassName from "@/utils/hooks/useClassName";
import getDiameterToFillParent from "@/utils/functions/getDiameterToFillContainer";

export interface Props {
    isActive?: boolean;
    isHovering?: boolean;
    isPressing?: boolean;
    className?: string;
    classNameObject?: string;
    mouseCoordinates?: boolean;
}

interface FlapObjectState {
    style: React.CSSProperties;
}

const Flap: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>> =
    forwardRef((props, ref?) => {
        /** ANCHOR: References */
        const flap = useRef<HTMLDivElement>(null);
        const flapObject = useRef<HTMLDivElement>(null);

        /** ANCHOR: ClassNames */
        const flapClassName = useClassName(scss["flap"], props.className);
        const flapObjectClassName = useClassName(scss["flap__object"], props.classNameObject);

        /** ANCHOR: Context */
        const relativeMouseCoordinates = useContext(RelativeMouseCoordinates);

        /** ANCHOR: State */
        const [currentRelativeMouseCoordinates, setCurrentRelativeMouseCoordinates] =
            useState<Coordinates>();
        const [flapObjectState, setFlapObjectState] = useState<FlapObjectState>({
            /** Initial State */
            style: {
                visibility: "hidden",
                height: "20px",
            },
        });

        /** ANCHOR: Callback */
        const setFlapObjectTranslation = useCallback((coordinates: Coordinates) => {
            if (!flapObject.current) return;

            const newCoordinates = {
                x: coordinates.x - flapObject.current.clientHeight / 2,
                y: coordinates.y - flapObject.current.clientHeight / 2,
            };

            setFlapObjectState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.transform = `translate3d(${newCoordinates.x}px, ${newCoordinates.y}px, 0px)`;
                })
            );
        }, []);
        const setFlapObjectVisibility = useCallback((visibility: "visible" | "hidden") => {
            setFlapObjectState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.visibility = visibility;
                })
            );
        }, []);
        const setFlapObjectSize = useCallback((sizeUp: boolean) => {
            if (!flap.current || !flapObject.current) return;

            if (sizeUp) {
                /** calculating circumference such that ButtonBackground fully fills the button */
                const newHeight = getDiameterToFillParent(flap.current);

                setFlapObjectState((prevState) =>
                    produce(prevState, (draft) => {
                        draft.style.height = `${newHeight}px`;
                    })
                );

                return;
            }

            setFlapObjectState((prevState) =>
                produce(prevState, (draft) => {
                    draft.style.height = "0px";
                })
            );
        }, []);

        /** ANCHOR: Effects */
        useEffect(() => {
            if (!flapObject.current) return;
            const resizeObserver = new ResizeObserver(() => {
                if (!currentRelativeMouseCoordinates) return;
                setFlapObjectTranslation(currentRelativeMouseCoordinates);
            });
            resizeObserver.observe(flapObject.current);

            /** Clean Up */
            return () => resizeObserver.disconnect();
        }, [currentRelativeMouseCoordinates, setFlapObjectTranslation]);

        useEffect(() => {
            /** update currentRelativeMouseCoordinates  */
            setCurrentRelativeMouseCoordinates(relativeMouseCoordinates);

            if (props.isActive) {
                /** Translation of FlapObject to the current mouse coordinates */
                setFlapObjectTranslation(relativeMouseCoordinates);
                /** Making the FlapObject visible */
                setFlapObjectVisibility("visible");
                /** Sizing the FlapObject such that it fills the entire Flap */
                setFlapObjectSize(true);

                return;
            }

            /** Making the FlapObject invisible */
            setFlapObjectVisibility("hidden");
            /** Sizing the FlapObject down such that it can be sized up again at the next hover event */
            setFlapObjectSize(false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.isActive]);

        return (
            <div className={flapClassName} ref={flap} {...(ref && { ref })}>
                <div
                    className={flapObjectClassName}
                    style={flapObjectState.style}
                    ref={flapObject}
                />
            </div>
        );
    });

Flap.displayName = "Flap";
export default Flap;
