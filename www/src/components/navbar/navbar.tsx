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
            <div></div>
        </div>
    )
}

export default Navbar
