"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input } from "@monocircuit/monolithium/components";
import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@monocircuit/monolithium/fonts";

import styles from "../SignIn/SignIn.module.scss";
import {
  signUp,
  signUpFormData,
  signUpSchema,
} from "@/components/SignUp/functions/signup";
import { signInWithGoogle } from "@/components/SignIn/functions/signInWithGoogle";

const SignUp: React.FunctionComponent<{ ButtonFunction?: () => void }> = ({
  ButtonFunction,
}) => {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: signUpFormData) => {
    setAuthError(null);
    const result = await signUp(data);
    if (result?.error) {
      setAuthError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
  };

  return (
    <div className={styles.signin}>
      {/* HEADER */}
      <div className={styles.signin__header}>
        <div className={styles.signin__header__title}>
          <div className={styles.signin__header__title__icon}>
            <SigninGraphic />
          </div>
          <div className={styles.signin__header__title__text}>SIGN UP</div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.signin__body}>
        {success ? (
          <div className={styles.signin__body__form}>
            <div className={styles.signin__body__form__success}>
              Check your email to verify your account.
            </div>
          </div>
        ) : (
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
              <Input
                placeholder="Confirm Password"
                type="password"
                className={styles.signin__body__form__input}
                inputClassName={SourceSans3.className}
                register={register("passwordconfirm", { required: true })}
                error={errors.passwordconfirm?.message}
              />
            </div>

            {authError && (
              <div className={styles.signin__body__form__error}>{authError}</div>
            )}

            <Button
              className={styles.signin__body__form__submit}
              formType="submit"
              text={isSubmitting ? "SIGNING UP..." : "SIGN UP"}
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
              text="Sign up with Google"
              onClick={() => signInWithGoogle()}
            />
          </form>
        )}
      </div>

      {/* FOOTER */}
      <Button
        onClick={() => ButtonFunction ? ButtonFunction() : router.push("/")}
        className={styles.signin__alt}
        text="HAVE AN ACCOUNT?"
      />
    </div>
  );
};

export default SignUp;
