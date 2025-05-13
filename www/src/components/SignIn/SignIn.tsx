"use client";

import React, { useEffect, useState, useActionState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button, Input } from "@monolithium/next/components";
import { useClassName } from "@monolithium/next/hooks";

import Cross from "@/assets/images/png/sharp_line/delete.png";
import SigninGraphic from "@/assets/images/svg/login2.svg";

import { signIn } from "./SignIn.actions";

import { SourceSans3 } from "@/utils/fonts";
import styles from "./SignIn.module.scss";

interface loginData {
  username: any;
  password: string;
}

const SignIn: React.FunctionComponent = () => {
  /** ANCHOR: Actions */
  const [signInState, signInAction] = useActionState(signIn);

  const {
    register,
    handleSubmit: handleSubmitWrapper,
    formState: { errors },
  } = useForm<loginData>();

  const router = useRouter();

  const [input, setInput] = useState<loginData>({
    username: "",
    password: "",
  });
  const [shouldRegister, setShouldRegister] = useState<boolean>(false);

  useEffect(() => {
    const c = register("username", { required: true });
    // console.log(c);
  }, []);

  return (
    <div className={styles["signin"]}>
      <div className={styles["signin__header"]}>
        <div className={styles["signin__header__title"]}>
          <div className={styles["signin__header__title__icon"]}>
            <SigninGraphic />
          </div>
          <div className={styles["signin__header__title__text"]}>sign in</div>
        </div>
      </div>
      <div className={styles["signin__body"]}>
        <div className={styles["signin__body__account"]}></div>
        <form className={styles["signin__body__form"]} action={signInAction}>
          <Input
            placeholder="Username"
            type="text"
            className={styles["signin__body__form__input__username"]}
            inputClassName={SourceSans3.className}
            register={register("username", { required: true })}
            error={!!errors.username ? "This field is required" : undefined}
          />
          <Input
            placeholder="Password"
            type="password"
            className={styles["signin__body__form__input__password"]}
            inputClassName={SourceSans3.className}
            register={register("password", { required: true })}
            error={!!errors.password ? "This field is required" : undefined}
          />
          <Button
            className={styles["signin__body__form__submit"]}
            formType="submit"
            text="Login"
            capslock
          ></Button>
        </form>
      </div>
      <Button
        className={styles["signin__alt"]}
        text="Dont have an account?"
      ></Button>
    </div>
  );
};

export default SignIn;
