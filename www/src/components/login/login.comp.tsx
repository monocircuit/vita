/** @format */
"use client"

import Input from "@/utils/input/input.utils"
import React, { useState } from "react"
import PocketBase from "pocketbase"

const pb = new PocketBase('https://pbe.eichenzell.nausseite.de');

interface loginData {
    email: string
    password: string
}


//Testuser email: test@monocircuit password: test12345
async function authFunction(email: string, password: string) {
    const userData = await pb
        .collection("users")
        .authWithPassword(email, password)

    console.log(userData)
    
}

function LoginComp() {
    const [input, setInput] = useState<loginData>({email: "", password: ""})
    console.log(input)

    console.log(pb.authStore.isValid);
    console.log(pb.authStore.token);
    console.log(pb.authStore.record?.id);

    return (
        <div className="flex h-full justify-center items-center">
            <div className="border-black border-2 rounded-lg w-[500px] h-[600px] m-2 flex justify-center items-center flex-col">
                <div className="flex-1"></div>
                <Input
                    placeholder="Email"
                    classNames="w-[300px]"
                    onChange={(e) => {
                        setInput({ email: e, password: input.password})
                    }}
                ></Input>
                <div className="flex-1"></div>
                <Input
                    placeholder="Password"
                    classNames="w-[300px]"
                    onChange={(e) => {
                        setInput({email: input.email, password: e })
                    }}
                ></Input>
                <div className="flex-1"></div>
                <button onClick={() => authFunction(input.email, input.password)}>Submit</button>
                <div className="flex-1"></div>
            </div>
        </div>
    )
}

export default LoginComp
