"use client";

import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import LoginTemp from "./logintemp";
import { auth } from "@/utils/pbHelper/auth/auth";

import Cross from "@/assets/images/png/sharp_line/delete.png";
import scss from "@/components/login/login.module.scss";
import Button from "@/utils/ui/button/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import Input from "@/utils/ui/input/input";

interface loginData {
    username: any;
    password: string;
}

//Testuser username: test@monocircuit BingoBongo password: test1234
const SignIn: React.FunctionComponent = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<loginData>();

    const onSubmit: SubmitHandler<loginData> = (data) => auth.login(data.username, data.password);

    const router = useRouter();

    const [input, setInput] = useState<loginData>({
        username: "",
        password: "",
    });
    const [needRegister, setNeedRegister] = useState<boolean>(false);

    useEffect(() => {
        const c = register("username", { required: true });
        console.log(c);
    }, []);

    console.log(watch("username"));
    console.log(watch("password"));
    return (
        <div className={scss["signin"]}>
            <div className={scss["signin__header"]}>
                <Button
                    className={scss.signin__header__logo}
                    iconSize={30}
                    onClick={() => router.push("/")}
                >
                    <Image src={Cross} alt="cross"></Image>
                </Button>
                <div className={scss["signin__header__divider"]}></div>
                <div className={scss["signin__header__text"]}>sign in</div>
            </div>
            <div className={scss["signin__body"]}>
                <form className={scss["signin__body__form"]} onSubmit={handleSubmit(onSubmit)}>
                    {/*// Username + Validation  */}
                    <Input
                        placeholder="Username"
                        classNames={[scss["signin__body__form__input__field"]]}
                        register={register("username", { required: true })}
                    />
                    {errors.username && <span>This field is required</span>}
                    {/*// Password + Validation  */}
                    <Input
                        placeholder="Password"
                        classNames={[scss["signin__body__form__input__field"]]}
                        register={register("password", { required: true })}
                    />
                    {errors.password && <span>This field is required</span>}

                    <Button
                        className={scss.test}
                        formType="submit"
                        text="Login"
                        onClick={() => router.push("/login")}
                        capslock
                    ></Button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
