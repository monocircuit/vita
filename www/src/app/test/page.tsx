"use client";

import { SourceSans3 } from "@/utils/fonts";
import { Input } from "@monolithium/next/components";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./test.module.scss";

function page() {
  interface loginData {
    username: any;
    password: string;
  }
  const {
    register,
    handleSubmit: handleSubmitWrapper,
    formState: { errors },
  } = useForm<loginData>();

  return (
    <div className={styles["tester"]}>
      <Input
        placeholder="Username"
        className={styles["button"]}
        type="text"
        inputClassName={SourceSans3.className}
        register={register("username")}
      />
    </div>
  );
}

export default page;
