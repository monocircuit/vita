/** @format */

import Input from "@/utils/input/input.utils"
import React, { useState } from "react"

interface props {
    regfunction: (obj: regData) => {}
    rootLogin: () => void
}

interface regData {
    username: string
    email: string
    password: string
}

const RegisTemp: React.FC<props> = (props) => {
    const [input, setInput] = useState<regData>({
        username: "",
        email: "",
        password: "",
    })
    return (
        <div className="flex flex-col">
            <div className="flex-1"></div>
            <Input
                placeholder="username"
                classNames="w-[300px] my-2"
                onChange={(e) => {
                    setInput({
                        username: e,
                        email: input.email,
                        password: input.password,
                    })
                }}
            ></Input>
            <Input
                placeholder="Email"
                classNames="w-[300px] my-2"
                onChange={(e) => {
                    setInput({
                        username: e,
                        email: input.email,
                        password: input.password,
                    })
                }}
            ></Input>
            <Input
                placeholder="Password"
                classNames="w-[300px] my-2"
                onChange={(e) => {
                    setInput({
                        username: input.username,
                        email: input.email,
                        password: e,
                    })
                }}
            ></Input>
            <Input
                placeholder="Password Confirmation"
                classNames="w-[300px] my-2"
                onChange={(e) => {
                    setInput({
                        username: input.username,
                        email: input.email,
                        password: e,
                    })
                }}
            ></Input>
            <div className="flex-1"></div>
            <div className="flex flex-row w-[400px] ">
                <button
                    className="border-2 border-black py-2 m-1 basis-1/4"
                    onClick={() => {
                        props.rootLogin
                    }}
                >
                    Login
                </button>
                <button
                    className="border-2 border-black py-2 m-1 flex-none basis-3/4"
                    onClick={() => props.regfunction(input)}
                >
                    Submit
                </button>
            </div>
            <div className="flex-1"></div>
        </div>
    )
}

export default RegisTemp
