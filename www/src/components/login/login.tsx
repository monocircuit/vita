"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/utils/pbHelper/auth/auth";

import Cross from "@/assets/images/png/sharp_line/delete.png";
import scss from "@/components/login/login.module.scss";
import Button from "@/utils/ui/button/button";
import SigninGraphic from "@/assets/images/svg/login2.svg";
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


    // console.log(watch("username"));
    // console.log(watch("password"));
    return (
        <div className={scss["signin"]}>
            <div className={scss["signin__header"]}>
                <Button
                    className={scss["signin__header__exit-button"]}
                    iconSize={30}
                    onClick={() => router.push("/")}
                >
                    <Image src={Cross} alt="cross"></Image>
                </Button>
                <div className={scss["signin__header__title"]}>
                    <div className={scss["signin__header__title__icon"]}>
                        <SigninGraphic />
                    </div>
                    <div className={scss["signin__header__title__text"]}>sign in</div>
                </div>
            </div>
            <div className={scss["signin__body"]}>
                <form className={scss["signin__body__form"]} onSubmit={handleSubmit(onSubmit)}>
                    <div className={scss["signin__body__form__divider__wrapper"]}>
                        <div className={scss["signin__body__form__divider"]} />
                        <div className={scss["signin__body__form__divider__text"]}>
                            sign in with your account
                        </div>
                        <div className={scss["signin__body__form__divider"]} />
                    </div>
                    <Input
                        placeholder="Username"
                        type="text"
                        className={scss["signin__body__form__input__username"]}
                        register={register("username", { required: true })}
                        error={!!errors.username ? "This field is required" : undefined}
                    />
                    <Input
                        placeholder="Password"
                        type="text"
                        className={scss["signin__body__form__input__password"]}
                        register={register("password", { required: true })}
                        error={!!errors.password ? "This field is required" : undefined}
                    />
                    <Button
                        className={scss["signin__body__form__submit"]}
                        formType="submit"
                        text="Login"
                        onClick={() => router.push("/login")}
                        capslock
                    ></Button>
                </form>
            </div>
            <Button className={scss["signin__alt"]} text="Dont have an account?"></Button>
        </div>
    );
};

export default SignIn;
