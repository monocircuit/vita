"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input } from "@monocircuit/monolithium/components";
import SigninGraphic from "@/assets/images/svg/login2.svg";
import { SourceSans3 } from "@monocircuit/monolithium/fonts";

import styles from "@/components/SignIn/SignIn.module.scss";
import { createClient } from "@/shared/data/client";
import {
  resetPasswordFormData,
  resetPasswordSchema,
  updatePassword,
} from "./functions/updatePassword";

type RecoveryState = "checking" | "ready" | "invalid" | "done";

const ResetPassword: React.FunctionComponent = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<resetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    const markReady = () => {
      if (cancelled || resolved) return;
      resolved = true;
      setRecoveryState("ready");
    };

    const run = async () => {
      const supabase = await createClient();

      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          markReady();
        }
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) markReady();

      setTimeout(() => {
        if (!cancelled && !resolved) {
          setRecoveryState("invalid");
        }
        sub.subscription.unsubscribe();
      }, 2000);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: resetPasswordFormData) => {
    setAuthError(null);
    const result = await updatePassword(data.password);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    setRecoveryState("done");
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className={styles.signin}>
      <div className={styles.signin__header}>
        <div className={styles.signin__header__title}>
          <div className={styles.signin__header__title__icon}>
            <SigninGraphic />
          </div>
          <div className={styles.signin__header__title__text}>
            RESET PASSWORD
          </div>
        </div>
      </div>

      <div className={styles.signin__body}>
        {recoveryState === "checking" && (
          <div className={styles.signin__body__form}>
            <div className={styles.signin__body__form__hint}>
              Verifying reset link…
            </div>
          </div>
        )}

        {recoveryState === "invalid" && (
          <div className={styles.signin__body__form}>
            <div className={styles.signin__body__form__error}>
              This reset link is invalid or has expired. Please request a new
              one.
            </div>
            <Button
              className={styles.signin__body__form__submit}
              text="BACK TO LOGIN"
              onClick={() => router.push("/login")}
              capslock
            />
          </div>
        )}

        {recoveryState === "done" && (
          <div className={styles.signin__body__form}>
            <div className={styles.signin__body__form__success}>
              Password updated. Redirecting…
            </div>
          </div>
        )}

        {recoveryState === "ready" && (
          <form
            className={styles.signin__body__form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={styles.signin__body__form__inputs}>
              <Input
                placeholder="New password"
                type="password"
                className={styles.signin__body__form__input}
                inputClassName={SourceSans3.className}
                register={register("password", { required: true })}
                error={errors.password?.message}
              />
              <Input
                placeholder="Confirm new password"
                type="password"
                className={styles.signin__body__form__input}
                inputClassName={SourceSans3.className}
                register={register("passwordconfirm", { required: true })}
                error={errors.passwordconfirm?.message}
              />
            </div>

            {authError && (
              <div className={styles.signin__body__form__error}>
                {authError}
              </div>
            )}

            <Button
              className={styles.signin__body__form__submit}
              formType="submit"
              text={isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
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

export default ResetPassword;
