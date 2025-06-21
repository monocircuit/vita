"use client";

import React, { useEffect, useState, useActionState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button, Input } from "@monolithium/next/components";
import { useClassName } from "@monolithium/next/hooks";

import Cross from "@/assets/images/png/sharp_line/delete.png";
import SigninGraphic from "@/assets/images/svg/login2.svg";

import { SourceSans3 } from "@monolithium/next/fonts";
import styles from "./SignIn.module.scss";
import { signIn, signInFormData, signInSchema } from "./functions/signIn";
import { zodResolver } from "@hookform/resolvers/zod";

const SignIn: React.FunctionComponent<{ ButtonFunction?: () => void }> = ({
  ButtonFunction,
}) => {
  /** ANCHOR: Forms */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();

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
        <form
          className={styles["signin__body__form"]}
          onSubmit={handleSubmit(e => signIn(e))}
        >
          <Input
            placeholder="Email"
            type="email"
            className={styles["signin__body__form__input__username"]}
            inputClassName={SourceSans3.className}
            register={register("email", { required: true })}
            error={errors.email?.message}
          />
          <Input
            placeholder="Password"
            type="password"
            className={styles["signin__body__form__input__password"]}
            inputClassName={SourceSans3.className}
            register={register("password", { required: true })}
            error={errors.password?.message}
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
        onClick={() => ButtonFunction?.()}
        className={styles["signin__alt"]}
        text="Dont have an account?"
      ></Button>
    </div>
  );
};

export default SignIn;
