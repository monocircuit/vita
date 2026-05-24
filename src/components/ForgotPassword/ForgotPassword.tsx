"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, Input } from "@monocircuit/monolithium/components";
import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@monocircuit/monolithium/fonts";

import styles from "@/components/SignIn/SignIn.module.scss";
import { requestPasswordReset } from "@/components/SignIn/functions/requestPasswordReset";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Invalid email address" }),
});

type forgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FunctionComponent = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<forgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: forgotPasswordFormData) => {
    setAuthError(null);
    const result = await requestPasswordReset(data.email);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <div className={styles.signin}>
      <div className={styles.signin__header}>
        <div className={styles.signin__header__title}>
          <div className={styles.signin__header__title__icon}>
            <SigninGraphic />
          </div>
          <div className={styles.signin__header__title__text}>
            FORGOT PASSWORD
          </div>
        </div>
      </div>

      <div className={styles.signin__body}>
        {sent ? (
          <div className={styles.signin__body__form}>
            <div className={styles.signin__body__form__success}>
              Check your inbox for a reset link.
            </div>
            <Button
              className={styles.signin__body__form__submit}
              text="BACK TO LOGIN"
              onClick={() => router.push("/login")}
              capslock
            />
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
            </div>

            <div className={styles.signin__body__form__hint}>
              We&apos;ll send a link to reset your password.
            </div>

            {authError && (
              <div className={styles.signin__body__form__error}>
                {authError}
              </div>
            )}

            <Button
              className={styles.signin__body__form__submit}
              formType="submit"
              text={isSubmitting ? "SENDING..." : "SEND RESET LINK"}
              isDisabled={isSubmitting}
              capslock
            />
          </form>
        )}
      </div>

      <Button
        onClick={() => router.push("/login")}
        className={styles.signin__alt}
        text="BACK TO LOGIN"
      />
    </div>
  );
};

export default ForgotPassword;
