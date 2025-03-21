"use client";

import React, { useState } from "react";

import scss from "@/utils/ui/popup/popup.module.scss";
import { Coordinates } from "@/utils/types/types";

interface Props {
    position: Coordinates;
}

const Popup: React.FunctionComponent<Props> = (props) => {
    const [popupState, setPopupState] = useState<React.CSSProperties>({
        /** Initial State */
        transform: `translate3d(${props.position.x}px, ${props.position.y}px, 0px)`,
    });

    return <div className={scss["popup"]} style={popupState}></div>;
};

export default Popup;
