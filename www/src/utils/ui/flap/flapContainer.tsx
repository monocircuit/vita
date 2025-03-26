"use client";

import React from "react";
import scss from "./FlapContainer.module.scss";

export interface Props {
    children?: React.ReactElement[];
}

const FlapContainer: React.FunctionComponent<Props> = ({ children }) => {
    return (
        <div className={scss["flap-container"]}>
            {React.Children.map(children, (child, index) => (
                <div className={scss["flap-container__child"]} style={{ zIndex: index }}>
                    {child}
                </div>
            ))}
        </div>
    );
};

export default FlapContainer;
