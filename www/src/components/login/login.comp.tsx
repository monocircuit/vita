/** @format */
"use client"

import Input from "@/utils/components/input/input.utils"
import React, { useState } from "react"

interface loginData {
    username?: string
    password?: string
}

function LoginComp() {
    const [input, setInput] = useState<loginData>({})
    return (
        <div className="flex h-full justify-center items-center">
            <div className="border-black border-2 rounded-lg w-[500px] h-[600px] m-2 flex justify-center items-center flex-col">
                <div className="flex-1"></div>
                <Input classNames="w-[300px]" onChange={() => {}}></Input>
                <div className="flex-1"></div>
                <Input classNames="w-[300px]" onChange={() => {}}></Input>
                <div className="flex-1"></div>
            </div>
        </div>
    )
}

export default LoginComp
