"use client";

import React, { useActionState } from "react";

import { Button, Input } from "@monolithium/next/components";

import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@/utils/fonts";

import { signup, SignInFormData } from "./actions";
import styles from "./SignUp.module.scss";
import { useForm } from "react-hook-form";

const SignUp: React.FunctionComponent = () => {
  /** ANCHOR: Actions */
  const [signUpState, signUpAction] = useActionState(signup);

  /** ANCHOR: Forms */
  const {
    register,
    formState: { errors },
  } = useForm<SignInFormData>();

  return (
    <div className={styles["signin"]}>
      <div className={styles["signin__header"]}>
        <div className={styles["signin__header__title"]}>
          <div className={styles["signin__header__title__icon"]}>
            <SigninGraphic />
          </div>
          <div className={styles["signin__header__title__text"]}>sign up</div>
        </div>
      </div>
      <div className={styles["signin__body"]}>
        <div className={styles["signin__body__account"]}></div>
        <form className={styles["signin__body__form"]} action={signUpAction}>
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

export default SignUp;
