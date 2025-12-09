"use client";

import React from "react";

import { Button } from "@monolithium/next/components";
import { FiraCode } from "@monolithium/next/fonts";

import SigninGraphic from "@/assets/images/svg/login2.svg";

import SignUpForm from "./forms/SignUpForm";

interface SignProps {
  signUp?: boolean;
  signIn?: boolean;
}

const Sign: React.FunctionComponent<SignProps> = props => {
  return (
    <div
      id="sign"
      className={`overflow-hidden w-full h-full grid grid-cols-[1fr] grid-rows-[42px_1fr_50px] border-solid border-(length:--stroke) border-secondary`}
    >
      <div
        id="sign-header"
        className={`flex justify-center items-center overflow-hidden border-solid border-b-(length:--stroke) border-secondary`}
      >
        <div
          id="sign-header__title"
          className={`flex flex-1 h-full justify-center items-center gap-[2px]`}
        >
          <div
            id="sign-header__title-logo"
            className={`h-[25px] aspect-square`}
          >
            <SigninGraphic />
          </div>
          {/** TODO: text-2xl not working */}
          <div
            id="sign-header__title-text"
            className={`inline-block uppercase text-lg ${FiraCode.className}`}
          >
            sign up
          </div>
        </div>
      </div>
      <div className={`flex justify-center items-center overflow-hidden`}>
        {props.signUp && <SignUpForm />}
      </div>
      <Button
        className={
          "overflow-hidden border-t-(length:--stroke) border-solid border-secondary"
        }
        text="Dont have an account?"
      ></Button>
    </div>
  );
};

export default Sign;
