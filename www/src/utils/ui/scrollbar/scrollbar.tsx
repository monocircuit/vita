"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import scss from "@/utils/ui/scrollbar/scrollbar.module.scss";
import { produce } from "immer";
import createChildMutator from "@/utils/react/createChildMutator";

type Props = {
    orientation: "right" | "left" | "top" | "bottom";
    children: React.ReactNode;
};

type ScrollbarState = React.CSSProperties;

const Scrollbar: React.FunctionComponent<Props> = ({ children: child, orientation }: Props) => {
    /** ANCHOR: References */
    const childRef = useRef<HTMLElement>(null);

    /** ANCHOR: State */
    const [scrollPercentage, setScrollPercentage] = useState<number>(0);
    const [scrollbarState, setScrollbarState] = useState<ScrollbarState>({
        /** Initial Style */
        width: `${scrollPercentage}%`,
    });

    /** ANCHOR: Callbacks */
    const calculatePercentage = useCallback(() => {
        const target = childRef.current;
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
        switch (orientation) {
            case "top":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.top = "0px";
                    })
                );
            case "bottom":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.bottom = "0px";
                    })
                );
            case "left":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.left = "0px";
                    })
                );
            case "right":
                setScrollbarState((p) =>
                    produce(p, (d) => {
                        d.right = "0px";
                    })
                );
        }
    }, [orientation, scrollbarState]);

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
            <div className={scss["scrollbar__wrapper"]} style={scrollbarState}>
                <div className={scss["scrollbar"]} />
            </div>
            {createChildMutator(child as any)
                .appendRef(childRef)
                .appendHandler("onScroll", handleScroll)
                .mutate()}
        </>
    );
};

export default Scrollbar;
