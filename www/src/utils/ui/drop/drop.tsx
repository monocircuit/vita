import React, { useCallback, useContext, useEffect, useRef } from "react";

import scss from "@/utils/ui/drop/drop.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import getDiameterToFillParent from "@/utils/functions/getDiameterToFillContainer";
import { RelativeMouseCoordinates } from "../passMouseCoordinates/passMouseCoordinates";
import { Coordinates } from "@/utils/types/types";

type Props = {
    className?: string;
    isActive?: boolean;

    /**
     * Duration of the animation in milliseconds.
     */
    duration?: number;
};

const Drop: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR: References */
    const dropWrapper = useRef<HTMLDivElement>(null);
    const animationDuration = useRef<number>(1000);

    /** ANCHOR: ClassNames */
    const dropClassName = useClassName(scss["drop"], props.className);

    /** ANCHOR: Context */
    const relativeMouseCoordinates = useContext(RelativeMouseCoordinates);

    /** ANCHOR: Callbacks */
    const translateDrop = useCallback(
        (drop: HTMLDivElement, relativeMouseCoordinates: Coordinates) => {
            const adjustedCoordinates = {
                x: relativeMouseCoordinates.x - drop.clientHeight / 2,
                y: relativeMouseCoordinates.y - drop.clientHeight / 2,
            };

            drop.style.transform = `translate3d(${adjustedCoordinates.x}px, ${adjustedCoordinates.y}px, 0px)`;
        },
        []
    );

    const createDrop = useCallback(
        (relativeMouseCoordinates: Coordinates) => {
            if (!dropWrapper.current) return;

            const drop = document.createElement("div");
            drop.className = dropClassName;
            drop.style.height = "50px";
            drop.style.transition = `height ${animationDuration.current}ms cubic-bezier(0.2, 0.72, 0.38, 1.02),
            filter ${animationDuration.current}ms cubic-bezier(0.2, 0.72, 0.38, 1.02)`;
            translateDrop(drop, relativeMouseCoordinates);

            const resizeObserver = new ResizeObserver(() =>
                translateDrop(drop, relativeMouseCoordinates)
            );
            resizeObserver.observe(drop);

            /** Drop is staged */
            dropWrapper.current.appendChild(drop);

            drop.style.height = `${getDiameterToFillParent(dropWrapper.current)}px`;
            drop.style.filter = "opacity(0%)";

            setTimeout(() => {
                /** CLEAN UP */
                if (!dropWrapper.current) return;
                dropWrapper.current.removeChild(drop);
                resizeObserver.disconnect();
            }, animationDuration.current);
        },
        [dropClassName, translateDrop]
    );

    /** ANCHOR: Effects */
    useEffect(() => {
        if (props.duration) {
            animationDuration.current = props.duration;
            return;
        }

        const animationDurationString = window
            .getComputedStyle(document.body)
            .getPropertyValue("--animation-duration");
        const animationDurationValueMatches = animationDurationString.match(/(\d+\.?\d*)/);
        const animationDurationUnitMatches = animationDurationString.match(/[a-zA-Z]+$/);

        if (animationDurationValueMatches && animationDurationUnitMatches) {
            const animationDurationValue = parseInt(animationDurationValueMatches[0]);
            const animationDurationUnit = animationDurationUnitMatches[0];

            switch (animationDurationUnit) {
                case "s":
                    animationDuration.current = animationDurationValue * 1000;
                    break;
                case "ms":
                    animationDuration.current = animationDurationValue;
                    break;
            }
            return;
        }
    }, [props.duration]);

    useEffect(() => {
        if (props.isActive) {
            createDrop(relativeMouseCoordinates);
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isActive, createDrop]);

    return <div className={scss["drop__wrapper"]} ref={dropWrapper}></div>;
};

export default Drop;
