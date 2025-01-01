/** @format */

import styles from "./page.module.scss"
import Navbar from "@/components/navbar/navbar"

export default function Home() {
    return (
        <div className={styles.page}>
            <Navbar></Navbar>
        </div>
    )
}
