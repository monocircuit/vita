/** @format */

import Input from "@/utils/ui/input/input.utils";
import React, { useState } from "react";

interface props {
    authfunction: (obj: loginData) => object;
    rootRegistration: () => void;
}

interface loginData {
    username: string;
    password: string;
}

const LoginTemp: React.FC<props> = (props) => {
    const [input, setInput] = useState<loginData>({
        username: "",
        password: "",
    });
    return (
        <div className="flex flex-col ">
            <div className="flex-1"></div>
            <Input
                placeholder="Username"
                classNames="w-[300px]"
                onChange={(e) => {
                    setInput({ username: e, password: input.password });
                }}
            ></Input>
            <div className="flex-1"></div>
            <Input
                placeholder="Password"
                classNames="w-[300px]"
                onChange={(e) => {
                    setInput({ username: input.username, password: e });
                }}
            ></Input>
            <div className="flex-1"></div>
            <div className="flex flex-row w-[400px] ">
                <button
                    className="border-2 border-black py-2 m-1 basis-1/4"
                    onClick={props.rootRegistration}
                >
                    Register
                </button>
                <button
                    className="border-2 border-black py-2 m-1 flex-none basis-3/4"
                    onClick={() => props.authfunction(input)}
                >
                    Submit
                </button>
            </div>
            <div className="flex-1"></div>
        </div>
    );
};

export default LoginTemp;
