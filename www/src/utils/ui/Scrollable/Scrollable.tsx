import React, { useCallback, useState } from "react";
import styles from "./Scrollable.module.scss";
import useClassName from "@/utils/hooks/useClassName";

type Props = {
    children: React.ReactElement<any, any>;
    className?: string;
    classNameScrollbar?: string;
    shouldScrollX?: boolean;
    shouldScrollY?: boolean;
};

const Scrollable = (props: Props) => {
    /** ANCHOR: ClassNames */
    const scrollableClassName = useClassName(props.className, styles["scrollable"]);
    const scrollbarWrapperClassName = useClassName(
        props.classNameScrollbar,
        styles["scrollable__scrollbar__wrapper"]
    );

    /** ANCHOR: State */
    const [scrollPercentage, setScrollPercentage] = useState<number>(0);

    /** ANCHOR: Callbacks */
    const calculatePercentage = useCallback((target: HTMLElement) => {
        const percentage =
            (1 -
                (target.scrollHeight - (target.scrollTop + target.clientHeight)) /
                    (target.scrollHeight - target.clientHeight)) *
            100;

        return percentage;
    }, []);

    /** ANCHOR: Handlers */
    const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
        setScrollPercentage(calculatePercentage(event.currentTarget));
    };

    return (
        <div
            className={scrollableClassName}
            style={{
                overflowX: props.shouldScrollX ? "scroll" : "hidden",
                overflowY: props.shouldScrollY ? "scroll" : "hidden",
            }}
            onScroll={handleScroll}
        >
            <div
                className={scrollbarWrapperClassName}
                style={{
                    width: `${scrollPercentage}%`,
                }}
            >
                <div className={styles["scrollable__scrollbar"]} />
            </div>
            <div className={styles["scrollable__content"]}>{props.children}</div>
        </div>
    );
};

export default Scrollable;
