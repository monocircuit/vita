/** @format */

import React from "react";

interface inputProps {
    onChange: () => void;
    classNames: string;
}

const Input: React.FC<inputProps> = (inputProps) => {
    return (
        <input
            onChange={inputProps.onChange}
            className={`${inputProps.classNames} rounded-t-lg bg-gray-200 border-b border-black focus:border-logoblue transition focus:border-2 px-2 pt-1 `}
        />
    );
};

export default Input;
