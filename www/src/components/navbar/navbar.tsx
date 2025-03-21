/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";

import { FunctionComponent, useEffect } from "react";
import Image from "next/image";

import scss from "./navbar.module.scss";

import profilePic from "@/assets/images/profilepic.jpg";
import SignInGraphic from "@/assets/images/svg/login2.svg";
import SignUpGraphic from "@/assets/images/svg/signup2.svg";
import MonocircuitLogo from "@/assets/images/svg/monocircuit.svg";

import Button from "@/utils/ui/button/button";
import { useRouter } from "next/navigation";
import Popup from "@/utils/ui/popup/popup";
import useOnScrollbarVisible from "@/utils/hooks/useOnScrollbarVisible";

const Navbar: FunctionComponent = () => {
    const router = useRouter();

    const signedIn = false;

    useOnScrollbarVisible(() => {
        console.log("scollbar visible");
    }, []);

    return (
        <>
            <div className={scss["navbar"]}>
                <div className={scss["navbar__logo"]}>
                    <MonocircuitLogo />
                    <div className={scss["navbar__divider"]}></div>
                </div>
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
                                    className={scss["navbar__account__icon__image"]}
                                    src={profilePic}
                                    alt="profile picture"
                                ></Image>
                            </div>
                        ) : (
                            <div className={scss["navbar__account__container__options"]}>
                                <div
                                    className={scss["navbar__account__container__options__signin"]}
                                >
                                    <Button
                                        type="primary"
                                        text="sign in"
                                        onPress={() => router.push("/login")}
                                        capslock
                                    >
                                        <SignInGraphic />
                                    </Button>
                                </div>
                                <div
                                    className={scss["navbar__account__container__options__divider"]}
                                ></div>
                                <div
                                    className={scss["navbar__account__container__options__signup"]}
                                >
                                    <Button type="secondary" text="sign up" capslock>
                                        <SignUpGraphic />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Popup position={{ x: 100, y: 300 }}></Popup>
        </>
    );
};

export default Navbar;
