import React, { forwardRef, useEffect, useState } from "react";

import { UseFormRegisterReturn } from "react-hook-form";
import { produce } from "immer";

import scss from "@/utils/ui/Input/Input.module.scss";
import Error from "@/assets/images/png/sharp_line/error.png";
import useClassName from "@/utils/hooks/useClassName";
import Flap from "../Flap/Flap";
import PassRelativeMouseCoordinates from "@/utils/ui/PassMouseCoordinates/PassMouseCoordinates";
import Image from "next/image";

type Props<Data extends Record<string, unknown>> = {
    register: UseFormRegisterReturn<Extract<keyof Data, string>>;
    type: string;
    placeholder: string;
    className?: string;
    error?: string;
};

type Data = Record<string, unknown>;

type InputWrapperState = React.CSSProperties;

const Input: React.ForwardRefExoticComponent<Props<Data> & React.RefAttributes<HTMLDivElement>> =
    forwardRef((props, ref?) => {
        /** ANCHOR: State */
        const [isFocused, setIsFocused] = useState<boolean>(false);
        const [inputWrapperState, setInputWrapperState] = useState<InputWrapperState>({
            /** Initial State */
        });

        /** ANCHOR: ClassNames */
        const inputClassNames = useClassName(scss["input"]);
        const inputWrapperClassNames = useClassName(scss["input__wrapper"], props.className);

        /** ANCHOR: Effects */
        useEffect(() => {
            console.log(props.error);
            if (props.error) {
                setInputWrapperState((prevState) =>
                    produce(prevState, (draft) => {
                        draft.border = `var(--stroke) solid var(--error-color)`;
                    })
                );
            } else {
                setInputWrapperState((prevState) =>
                    produce(prevState, (draft) => {
                        draft.border = `var(--stroke) solid var(--primary-color)`;
                    })
                );
            }
        }, [props.error]);

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
                <div
                    className={inputWrapperClassNames}
                    style={inputWrapperState}
                    {...(ref && { ref })}
                >
                    <div className={scss["input__wrapper__background"]}>
                        <Flap
                            classNameObject={scss["input__wrapper__background__flap"]}
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
                            type={props.type}
                        />
                    </div>
                    {props.error ? (
                        <div className={scss["input__wrapper__error"]}>
                            <span>{props.error}</span>
                            <Image src={Error} alt="test"></Image>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </PassRelativeMouseCoordinates>
        );
    });

Input.displayName = "Input";
export default Input;
