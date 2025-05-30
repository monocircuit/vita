"use client";

import React, { useActionState } from "react";

import { Button, Input } from "@monolithium/next/components";

import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@/utils/fonts";

import styles from "./SignUp.module.scss";
import { useForm } from "react-hook-form";
import { signUp, signUpFormData, signUpSchema } from "@/components/SignUp/functions/signup";
import { zodResolver } from "@hookform/resolvers/zod";

const SignUp: React.FunctionComponent = () => {
  /** ANCHOR: Actions */

  /** ANCHOR: Forms */
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<signUpFormData>(
    {
      resolver: zodResolver(signUpSchema)
    }
  );



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
        <form className={styles["signin__body__form"]} onSubmit={handleSubmit((e) => signUp(e))}>
          <Input
            placeholder="Email"
            type="email"
            className={styles["signin__body__form__input__password"]}
            inputClassName={SourceSans3.className}
            register={register("email", { required: true })}
            error={errors.email?.message}
          />
          <Input
            placeholder="Password"
            type="password"
            className={styles["signin__body__form__input__username"]}
            inputClassName={SourceSans3.className}
            register={register("password", { required: true })}
            error={errors.password?.message}
          />
          <Input
            placeholder="Password repeat"
            type="password"
            className={styles["signin__body__form__input__password"]}
            inputClassName={SourceSans3.className}
            register={register("passwordconfirm", { required: true })}
            error={errors.passwordconfirm?.message}
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
        text="Have an Account?"
      ></Button>
    </div>
  );
};

export default SignUp;
