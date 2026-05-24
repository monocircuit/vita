"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input } from "@monocircuit/monolithium/components";
import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@monocircuit/monolithium/fonts";

import styles from "./SignIn.module.scss";
import { signIn, signInFormData, signInSchema } from "./functions/signIn";
import { signInWithGoogle } from "./functions/signInWithGoogle";

const SignIn: React.FunctionComponent<{ ButtonFunction?: () => void }> = ({
  ButtonFunction,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: signInFormData) => {
    setAuthError(null);
    const result = await signIn(data);
    if (result?.error) setAuthError(result.error);
  };

  return (
    <div className={styles.signin}>
      {/* HEADER */}
      <div className={styles.signin__header}>
        <div className={styles.signin__header__title}>
          <div className={styles.signin__header__title__icon}>
            <SigninGraphic />
          </div>
          <div className={styles.signin__header__title__text}>SIGN IN</div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.signin__body}>
        <form
          className={styles.signin__body__form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.signin__body__form__inputs}>
            <Input
              placeholder="Email"
              type="email"
              className={styles.signin__body__form__input}
              inputClassName={SourceSans3.className}
              register={register("email", { required: true })}
              error={errors.email?.message}
            />
            <Input
              placeholder="Password"
              type="password"
              className={styles.signin__body__form__input}
              inputClassName={SourceSans3.className}
              register={register("password", { required: true })}
              error={errors.password?.message}
            />
          </div>

          {authError && (
            <div className={styles.signin__body__form__error}>{authError}</div>
          )}

          <button
            type="button"
            className={styles.signin__body__form__forgot}
            onClick={() => router.push("/forgot-password")}
          >
            Forgot password?
          </button>

          <Button
            className={styles.signin__body__form__submit}
            formType="submit"
            text={isSubmitting ? "SIGNING IN..." : "LOGIN"}
            isDisabled={isSubmitting}
            capslock
          />

          <div className={styles.signin__body__form__divider__wrapper}>
            <div className={styles.signin__body__form__divider} />
            <span className={`${styles.signin__body__form__divider__text} ${SourceSans3.className}`}>
              or
            </span>
            <div className={styles.signin__body__form__divider} />
          </div>

          <Button
            className={styles.signin__body__form__button}
            text="Sign in with Google"
            onClick={() => signInWithGoogle()}
          />
        </form>
      </div>

      {/* FOOTER */}
      <Button
        onClick={() => ButtonFunction ? ButtonFunction() : router.push("/")}
        className={styles.signin__alt}
        text="DONT HAVE AN ACCOUNT?"
      />
    </div>
  );
};

export default SignIn;
