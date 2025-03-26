"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import scss from "@/utils/ui/ScrollContainer/ScrollContainer.module.scss";
import { produce } from "immer";
import createChildMutator from "@/utils/react/createChildMutator";
import useClassName from "@/utils/hooks/useClassName";

type Props = {
    orientation: "right" | "left" | "top" | "bottom";
    children: React.ReactNode;
    className?: string;
    yScroll?: boolean;
    xScroll?: boolean;
};

type ScrollbarState = React.CSSProperties;

const ScrollContainer: React.FunctionComponent<Props> = (props) => {
    /** ANCHOR: References */
    const scrollContainer = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLElement>(null);

    /** ANCHOR: State */
    const [scrollContainerStyle, setScrollContainerStyle] = useState<React.CSSProperties>({
        /** Initial Style */
        ...(props.xScroll && { overflowX: "scroll" }),
        ...(props.yScroll && { overflowY: "scroll" }),
    });

    const [scrollPercentage, setScrollPercentage] = useState<number>(0);
    const [scrollbarState, setScrollbarState] = useState<ScrollbarState>({
        /** Initial Style */
        width: `${scrollPercentage}%`,
    });

    /** ANCHOR: ClassNames */
    const scrollContainerClassName = useClassName(scss["scroll-container"], props.className);

    /** ANCHOR: Callbacks */
    const calculatePercentage = useCallback(() => {
        const target = scrollContainer.current;
        if (!target) return;
        const percentage =
            (1 -
                (target.scrollHeight - (target.scrollTop + target.clientHeight)) /
                    (target.scrollHeight - target.clientHeight)) *
            100;

        return percentage;
    }, []);

    /** ANCHOR: Effects */
    useEffect(() => {
        switch (props.orientation) {
            case "top":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.top = "0px";
                    })
                );
                break;
            case "bottom":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.bottom = "0px";
                    })
                );
                break;
            case "left":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.left = "0px";
                    })
                );
                break;
            case "right":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.right = "0px";
                    })
                );
                break;
        }
    }, [props.orientation, scrollbarState]);

    /** ANCHOR: Handlers */
    const handleScroll: React.UIEventHandler<HTMLDivElement> = () => {
        setScrollbarState((prevState) =>
            produce(prevState, (draft) => {
                draft.width = `${calculatePercentage()}%`;
            })
        );
    };

    return (
        <>
            <div
                className={scrollContainerClassName}
                style={scrollContainerStyle}
                ref={scrollContainer}
                onScroll={handleScroll}
            >
                {createChildMutator(props.children as any)
                    .appendRef(childRef)
                    .appendChild(
                        <div className={scss["scrollbar__wrapper"]} style={scrollbarState}>
                            <div className={scss["scrollbar"]} />
                        </div>
                    )
                    .appendHandler("onScroll", handleScroll)
                    .mutate()}
            </div>
        </>
    );
};

export default ScrollContainer;
