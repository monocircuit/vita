import React, { useEffect, useState } from "react";

import { UseFormRegisterReturn } from "react-hook-form";
import { produce } from "immer";

import scss from "@/utils/ui/input/input.module.scss";
import useClassName from "@/utils/hooks/useClassName";
import Flap from "../flap/flap";
import PassRelativeMouseCoordinates from "@/utils/ui/passMouseCoordinates/passMouseCoordinates";

type Props<Data extends Record<string, unknown>> = {
    register: UseFormRegisterReturn<Extract<keyof Data, string>>;
    placeholder: string;
    classNames?: string[];
    type?: "primary" | "secondary";
};

type InputWrapperState = React.CSSProperties;

const Input = <Data extends Record<string, unknown>>(props: Props<Data>) => {
    /** ANCHOR: State */
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const [inputWrapperState, setInputWrapperState] = useState<InputWrapperState>({
        /** Initial State */
    });

    /** ANCHOR: ClassNames */
    const inputClassNames = useClassName(scss["input"]);
    const inputWrapperClassNames = useClassName(scss["input__wrapper"], props.classNames);

    /** ANCHOR: Handlers */
    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
        setIsFocused(true);

        setInputWrapperState((prevState) => produce(prevState, (draft) => {}));
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
        setIsFocused(false);

        setInputWrapperState((prevState) => produce(prevState, (draft) => {}));
    };

    return (
        <PassRelativeMouseCoordinates>
            <div className={inputWrapperClassNames} style={inputWrapperState}>
                <div className={scss["input__wrapper__background"]}>
                    <Flap
                        className={scss["input__wrapper__background__flap"]}
                        isActive={isFocused}
                    />
                </div>
                <div className={scss["input__wrapper__foreground"]}>
                    <input
                        className={inputClassNames}
                        placeholder={props.placeholder}
                        {...props.register}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        </PassRelativeMouseCoordinates>
    );
};

export default Input;
