/** @format */
"use client"
import React from "react"

interface inputProps {
    onChange: (e: string) => void
    classNames: string
    placeholder?: string
    type?: string
}

const Input: React.FC<inputProps> = (inputProps) => {
    return (
        <input
            type={`${inputProps.type}`}
            placeholder={
                inputProps.placeholder ? `${inputProps.placeholder}` : "Input"
            }
            onChange={(e) => inputProps.onChange(e.target.value)}
            className={`${inputProps.classNames} rounded-tl-lg rounded-br-lg bg-gray-200 border-b border-black focus:border-logoblue  focus:border-2 px-2 pt-1 `}
        />
    )
}

export default Input
