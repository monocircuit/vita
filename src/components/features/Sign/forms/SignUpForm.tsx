"use client";

import { Button, Input } from "@monocircuit/monolithium/components";
import React, { useActionState } from "react";

import { SourceSans3 } from "@monocircuit/monolithium/fonts";

import signup, {
  type SignUpActionState,
} from "@/components/features/Sign/actions/signup";

interface Props {}

const initialState: SignUpActionState = {
  user: null,
  session: null,
  error: null,
};

const SignUpForm = (props: Props) => {
  const [signUpActionState, signUpAction, isPending] = useActionState(
    signup,
    initialState,
  );

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
        isDisabled={isPending}
      />
    </form>
  );
};

export default SignUpForm;
