"use client";

import React, { useState } from "react";
import PocketBase from "pocketbase";
import LoginTemp from "./logintemp";
import { auth } from "@/utils/auth/auth";

interface loginData {
    username: string;
    password: string;
}

//Testuser username: test@monocircuit BingoBongo password: test1234

function LoginComp() {
    const [input, setInput] = useState<loginData>({
        username: "",
        password: "",
    });
    const [needRegister, setNeedRegister] = useState<boolean>(false);

    return (
        <div className="flex h-full justify-center items-center">
            <div className="border-black border-2 rounded-lg w-[500px] h-[600px] m-2 flex justify-center items-center flex-col">
                {!needRegister ? (
                    <LoginTemp
                        rootRegistration={() => setNeedRegister(true)}
                        authfunction={(e) => auth.login(e.username, e.password)}
                    />
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    );
}

export default LoginComp;
