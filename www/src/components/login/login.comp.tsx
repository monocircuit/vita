/** @format */
"use client"

import Input from "@/utils/input/input.utils"
import React, { useState } from "react"
import PocketBase from "pocketbase"
import LoginTemp from "./logintemp"
import RegisTemp from "./registemp"

const pb = new PocketBase("https://pbe.eichenzell.nausseite.de")

interface loginData {
    username: string
    password: string
}

//Testuser username: test@monocircuit password: test12345
async function authFunction(username: string, password: string) {
    const userData = await pb
        .collection("users")
        .authWithPassword(username, password)
}

function LoginComp() {
    const [input, setInput] = useState<loginData>({
        username: "",
        password: "",
    })
    const [needRegister, setNeedRegister] = useState<boolean>(false)

    console.log(pb.authStore.isValid)
    console.log(pb.authStore.token)
    console.log(pb.authStore.record?.id)

    return (
        <div className="flex h-full justify-center items-center">
            <div className="border-black border-2 rounded-lg w-[500px] h-[600px] m-2 flex justify-center items-center flex-col">
                {!needRegister ? (
                    <LoginTemp
                        rootRegistration={() => setNeedRegister(true)}
                        authfunction={(e) =>
                            authFunction(e.username, e.password)
                        }
                    />
                ) : (
                    <RegisTemp rootLogin={() => setNeedRegister(false)} regfunction={(e) => {}}/>   
                )}
            </div>
        </div>
    )
}

export default LoginComp
