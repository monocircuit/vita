/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";

import { FunctionComponent, useEffect, useState } from "react";
import Image from "next/image";

import scss from "./navbar.module.scss";

import profilePic from "@/assets/images/profilepic.jpg";
import SignInGraphic from "@/assets/images/svg/login2.svg";
import SignUpGraphic from "@/assets/images/svg/signup2.svg";
import MonocircuitLogo from "@/assets/images/svg/monocircuit.svg";

import Button from "@/utils/ui/button/button";
import { redirect, useRouter } from "next/navigation";
import Popup from "@/utils/ui/popup/popup";
import useOnScrollbarVisible from "@/utils/hooks/useOnScrollbarVisible";
import auth from "@/utils/pbHelper/auth/auth";
import { tree } from "next/dist/build/templates/app-page";

const Navbar: FunctionComponent = () => {
    const [signedIn, setSingedIn] = useState<boolean>();
    const router = useRouter();

    useEffect(() => {
        setSingedIn(auth.isAuthenticated());
    }, []);

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
                        {signedIn ? (
                            <div className={scss["navbar__account__icon"]}>
                                <Image
                                    onClick={() => {
                                        router.push("/home");
                                    }}
                                    className={scss["navbar__account__icon__image"]}
                                    src={profilePic}
                                    alt="profile picture"
                                ></Image>
                            </div>
                        ) : (
                            <div className={scss["navbar__account__container__options"]}>
                                <Button
                                    className={scss["navbar__account__container__options__signin"]}
                                    type="primary"
                                    text="sign in"
                                    onClick={() => router.push("/login")}
                                    capslock
                                    vibrate
                                >
                                    <SignInGraphic />
                                </Button>
                                <div
                                    className={scss["navbar__account__container__options__divider"]}
                                ></div>
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
            <Popup className={scss.popup} position={{ x: 100, y: 50 }}>
                test
            </Popup>
            <Popup className={scss.popup2} position={{ x: 300, y: 0 }}>
                ladida
            </Popup>
        </>
    );
};

export default Navbar;
