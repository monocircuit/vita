/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

import styles from "./navbar.module.scss"
import { FunctionComponent } from "react"

const Navbar: FunctionComponent = () => {
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
                {/**
                 * Contains the profile icon
                 */}
                <div className={styles["navbar__account__profile"]}></div>
                {/**
                 * Contains the options to login, sign up
                 */}
                <div className={styles["navbar__account__options"]}></div>
            </div>
        </div>
    )
}

export default Navbar
