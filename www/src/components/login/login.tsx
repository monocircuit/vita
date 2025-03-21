"use client";

import React, { useState } from "react";
import PocketBase from "pocketbase";
import LoginTemp from "./logintemp";
import { auth } from "@/utils/auth/auth";

import Cross from "@/assets/images/png/sharp_line/delete.png";
import scss from "@/components/login/login.module.scss";
import Button from "@/utils/ui/button/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface loginData {
    username: any;
    password: string;
}

//Testuser username: test@monocircuit BingoBongo password: test1234
const SignIn: React.FunctionComponent = () => {
    const router = useRouter();

    const [input, setInput] = useState<loginData>({
        username: "",
        password: "",
    });
    const [needRegister, setNeedRegister] = useState<boolean>(false);

    return (
        <div className={scss["signin"]}>
            <div className={scss["signin__header"]}>
                <div className={scss["signin__header__logo"]}>
                    <Button iconSize={30} onPress={() => router.push("/")}>
                        <Image src={Cross} alt="cross"></Image>
                    </Button>
                </div>
                <div className={scss["signin__header__divider"]}></div>
                <div className={scss["signin__header__text"]}>sign in</div>
            </div>
            <div className={scss["signin__body"]}></div>
        </div>
    );
};

export default SignIn;

{
    /* <div className="flex h-full justify-center items-center">
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
        </div> */
}
