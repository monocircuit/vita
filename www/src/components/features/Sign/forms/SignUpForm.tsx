"use client";

import { Button, Input } from "@monolithium/next/components";
import React, { useActionState } from "react";

import { SourceSans3 } from "@/utils/fonts";

import signup from "@/components/Sign/actions/signup";

interface Props {}

const SignUpForm = (props: Props) => {
  const [signUpActionState, signUpAction] = useActionState(signup);

  return (
    <form
      className={`w-[min(300px,90%)] overflow-hidden flex flex-col gap-[10px]`}
      action={signUpAction}
    >
      <Input
        name="email"
        placeholder="Email"
        type="text"
        className={`h-[40px]`}
        inputClassName={SourceSans3.className}
      />
      <Input
        name="password"
        placeholder="Password"
        type="password"
        className={`h-[40px]`}
        inputClassName={SourceSans3.className}
      />
      <Button
        className={`h-[40px] border-solid border-(length:--stroke) border-(--primary-color)`}
        formType="submit"
        text="Login"
        capslock
      />
    </form>
  );
};

export default SignUpForm;
