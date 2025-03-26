import React from "react";
import scss from "@/utils/ui/box/box.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import Button from "../button/button";
import Cross from "@/assets/images/png/sharp_line/delete.png";
import router from "next/router";
import Image from "next/image";

interface props {
    className?: string;
    classNameBody?: string;
    children: React.ReactNode;
    headerIcon?: React.ReactNode;
    headerText?: string;
    onExitClick?: () => void;
}

const Box: ({
    className,
    children,
    classNameBody,
    headerIcon,
    headerText,
    onExitClick,
}: props) => React.ReactNode = ({
    className,
    children,
    classNameBody,
    headerIcon,
    headerText,
    onExitClick,
}: props) => {
    const boxClassName = useClassName(scss["box"], className);
    const boxBodyClassName = useClassName(scss["body"], classNameBody);

    return (
        <div className={boxClassName}>
            <div className={scss["header"]}>
                <Button
                    className={scss["header_button"]}
                    iconSize={30}
                    onClick={() => onExitClick}
                >
                    <Image src={Cross} alt="cross"></Image>
                </Button>
                <div className={scss["header_title"]}>
                    {headerIcon ? (
                        <div className={scss["header_title_icon"]}>{headerIcon}</div>
                    ) : null}
                    {headerText ? (
                        <div className={scss["header_title_text"]}>{headerText}</div>
                    ) : null}
                </div>
            </div>
            <div className={boxBodyClassName}>{children}</div>
        </div>
    );
};

export default Box;
