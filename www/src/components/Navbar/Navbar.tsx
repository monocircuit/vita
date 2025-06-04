/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button, Popover } from "@monolithium/next/components";
import scss from "./Navbar.module.scss";

import profilePic from "@/assets/images/profilepic.jpg";
import SignInGraphic from "@/assets/images/svg/login2.svg";
import SignUpGraphic from "@/assets/images/svg/signup2.svg";
import MonocircuitLogo from "../../../public/static/icons/monocircuit.svg";

import useOnScrollbarVisible from "@/hooks/useOnScrollbarVisible";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { createClient } from "@/utils/supabase/client";


import Sign from "../Sign/Sign";

const Navbar: FunctionComponent = () => {

  /** ANCHOR: References */
  const signInButton = useRef<HTMLDivElement>(null);

  /** ANCHOR: State */
  const [isSignInPopUpActive, setIsSignInPopupActive] =
    useState<boolean>(false);
  const [isSignUpPopUpActive, setIsSignUpPopupActive] =
    useState<boolean>(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null); // null = unknown

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };
    getUser();
  }, []);

  const router = useRouter();


  useOnScrollbarVisible(() => {
    console.log("scollbar visible");
  }, []);



  return (
    <>
      <div className={scss["navbar"]}>
        <Button
          className={scss["navbar__logo"]}
          classNameDrop={scss["navbar__logo__drop"]}
          onClick={() => router.push("/")}
          onlyClickAnimation
          vibrate
        >
          <MonocircuitLogo />
        </Button>
        <div className={scss["navbar__divider"]}></div>
        <div className={scss["navbar__title"]}></div>
        {/**
         * Part of the Navbar that is concerned with the users account,
         * it gives the option to login, sign up and shows the profile icon.
         *
         * If the user is not logged in, "navbar__account__profile" is shown,
         * otherwise "navbar__account__options" is displayed.
         */}
        <div className={scss["navbar__account"]}>
          <div className={scss["navbar__account__text"]}>account</div>
          <div className={scss["navbar__divider"]}></div>
          <div className={scss["navbar__account__container"]}>
            {isSignedIn ? (
              <div className={scss["navbar__account__icon"]}>
                <Image
                  className={scss["navbar__account__icon__image"]}
                  src={profilePic}
                  alt="profile picture"
                ></Image>
              </div>
            ) : (
              <div className={scss["navbar__account__container__options"]}>
                <Popover
                  content={<SignIn ButtonFunction={() => {
                    setIsSignInPopupActive(false)
                    setIsSignUpPopupActive(true)
                  }} />}
                  className={
                    scss["navbar__account__container__options__signin__popup"]
                  }
                  shouldRender={isSignInPopUpActive}
                  config={{
                    pushTo: "left",
                    isConnected: true,
                    isDraggable: true,
                    isClosableByEmptyClick: true,
                  }}
                >
                  <Button
                    ref={signInButton}
                    className={
                      scss[
                      "navbar__account__container__options__signin__button"
                      ]
                    }
                    text="sign in"
                    onClick={() => setIsSignInPopupActive(!isSignInPopUpActive)}
                    capslock
                    vibrate
                  >
                    <SignInGraphic />
                  </Button>
                </Popover>
                <div
                  className={
                    scss["navbar__account__container__options__divider"]
                  }
                ></div>
                <Popover
                  content={<SignUp ButtonFunction={() => {
                    setIsSignUpPopupActive(false)
                    setIsSignInPopupActive(true)
                  }} />}
                  className={
                    scss["navbar__account__container__options__signin__popup"]
                  }
                  shouldRender={isSignUpPopUpActive}
                  config={{
                    pushTo: "left",
                    isConnected: true,
                    isDraggable: true,
                    isClosableByEmptyClick: true,
                  }}
                >
                  <Button
                    className={
                      scss["navbar__account__container__options__signup"]
                    }
                    onClick={() => setIsSignUpPopupActive(!isSignUpPopUpActive)}
                    type="secondary"
                    text="sign up"
                    capslock
                    vibrate
                  >
                    <SignUpGraphic />
                  </Button>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
