/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";

import { FunctionComponent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button, Popover } from "@monolithium/next/components";

import scss from "./Navbar.module.scss";

import profilePic from "@/assets/images/profilepic.jpg";
import SignInGraphic from "@/assets/images/svg/login2.svg";
import SignUpGraphic from "@/assets/images/svg/signup2.svg";
import MonocircuitLogo from "../../../public/static/icons/monocircuit.svg";

import useOnScrollbarVisible from "@hooks/useOnScrollbarVisible";

import Login from "@/components/Login";

const Navbar: FunctionComponent = () => {
  /** ANCHOR: References */
  const signInButton = useRef<HTMLDivElement>(null);

  /** ANCHOR: State */
  const [isSignInPopUpActive, setIsSignInPopupActive] = useState<boolean>(false);

  const router = useRouter();

  const isSignedIn = false;

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
                  content={<Login />}
                  className={scss["navbar__account__container__options__signin__popup"]}
                  shouldRender={isSignInPopUpActive}
                  config={{
                    pushTo: "left",
                    isConnected: true,
                    isDraggable: true,
                  }}
                >
                  <Button
                    ref={signInButton}
                    className={scss["navbar__account__container__options__signin__button"]}
                    text="sign in"
                    onClick={() => setIsSignInPopupActive(!isSignInPopUpActive)}
                    capslock
                    vibrate
                  >
                    <SignInGraphic />
                  </Button>
                </Popover>
                <div className={scss["navbar__account__container__options__divider"]}></div>
                <Button
                  className={scss["navbar__account__container__options__signup"]}
                  type="secondary"
                  text="sign up"
                  capslock
                  vibrate
                >
                  <SignUpGraphic />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
