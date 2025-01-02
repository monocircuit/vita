/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";

import styles from "./navbar.module.scss";
import { FunctionComponent } from "react";
import Image from "next/image";

import profilePic from "@/assets/images/profilepic.jpg";
import cross from "@/assets/images/cross.png";

import Button from "@/utils/button/button";

const Navbar: FunctionComponent = () => {
    const signedIn = false;

    return (
        <div className={styles["navbar"]}>
            {/**
             * Part of the Navbar that is concerned with the users account,
             * it gives the option to login, sign up and shows the profile icon.
             *
             * If the user is not logged in, "navbar__account__profile" is shown,
             * otherwise "navbar__account__options" is displayed.
             */}
            <div className={styles["navbar__account"]}>
                {signedIn ? (
                    /**
                     * Contains the profile icon
                     */
                    <div className={styles["navbar__account__icon"]}>
                        <Image
                            className={styles["navbar__account__icon__image"]}
                            src={profilePic}
                            alt="profile picture"
                        ></Image>
                    </div>
                ) : (
                    /**
                     * Contains the options to login, sign up
                     */
                    <div className={styles["navbar__account__options"]}>
                        <div className={styles["navbar__account__options__login"]}>
                            <Button
                                text="Log In"
                                icon={<Image src={cross} alt="cross"></Image>}
                            ></Button>
                        </div>
                        <div className={styles["navbar__account__options__signup"]}>
                            <Button text="Sign Up"></Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
